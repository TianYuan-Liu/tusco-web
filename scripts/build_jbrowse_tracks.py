#!/usr/bin/env python3
"""Build the genome browser tracks of one release and species under data/jbrowse/<release>/<species>/.

usage: build_jbrowse_tracks.py --release 2026.10 --species human --data-dir data \
           --gencode-gtf gencode.v50.annotation.gtf.gz --gencode-gff3 gencode.v50.annotation.gff3.gz \
           --assembly-report GCF_000001405.40_GRCh38.p14_assembly_report.txt [--window 50000]

Writes
  chrom.sizes                 assembled chromosomes, UCSC names (chr1, ..., chrM)
  tusco_universal.gff3        universal genes of the release
  tusco_tissues.gff3          genes of any tissue set, with the number and names of the tissues
  gencode.gff3.gz(.tbi)       GENCODE genes within --window bp of a TUSCO gene (sorted, bgzipped, tabix)
Gene structures come from the release's GTF files when present, else from --gencode-gtf.
Needs pysam (bgzip / tabix).
"""
import argparse
import collections
import gzip
import json
import os
import re
import urllib.parse

import pysam

ATTR = re.compile(r'(\S+) "([^"]*)"')


def open_text(path):
    return gzip.open(path, "rt") if path.endswith(".gz") else open(path)


def gtf_records(path, genes=None):
    """GTF lines as (fields, attrs) for the given version-stripped gene ids (all if None)."""
    with open_text(path) as fh:
        for line in fh:
            if line.startswith("#"):
                continue
            f = line.rstrip("\n").split("\t")
            if len(f) < 9:
                continue
            attrs = collections.defaultdict(list)
            for k, v in ATTR.findall(f[8]):
                attrs[k].append(v)
            gid = attrs["gene_id"][0].split(".")[0]
            if genes is None or gid in genes:
                yield f, attrs, gid


def esc(v):
    return urllib.parse.quote(str(v), safe=" /:().,-_|")


def gtf_to_gff3(records, extra=None):
    """GTF records -> GFF3 lines (gene, transcript, exon, CDS). extra: gene id -> {attr: value}."""
    out = []
    for f, a, gid in records:
        kind = f[2]
        if kind not in ("gene", "transcript", "exon", "CDS"):
            continue
        if 'tag "Ensembl_canonical_extended"' in f[8] or "Ensembl_canonical_extended" in a.get("tag", []):
            continue  # GENCODE v50 copies of MANE transcripts, not separate isoforms
        if kind == "gene":
            attrs = {"ID": gid, "Name": a["gene_name"][0], "gene_id": a["gene_id"][0], "gene_type": a["gene_type"][0]}
            attrs.update((extra or {}).get(gid, {}))
            ftype = "gene"
        elif kind == "transcript":
            tid = a["transcript_id"][0]
            attrs = {"ID": tid, "Parent": gid, "Name": a.get("transcript_name", [tid])[0],
                     "transcript_type": a.get("transcript_type", [""])[0]}
            ftype = "mRNA" if a.get("transcript_type", [""])[0] == "protein_coding" else "transcript"
        else:
            attrs = {"Parent": a["transcript_id"][0]}
            ftype = kind
        col9 = ";".join(f"{k}={esc(v)}" for k, v in attrs.items() if v != "")
        out.append("\t".join([f[0], "TUSCO", ftype, f[3], f[4], ".", f[6], f[7] if kind == "CDS" else ".", col9]))
    return out


def sort_key(line):
    f = line.split("\t")
    return (f[0], int(f[3]), -int(f[4]))


def table_ids(path):
    with open(path) as fh:
        return [l.split("\t")[0].split(".")[0] for l in fh if l.strip() and not l.startswith(("#", "Gene_ID"))]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--release", required=True)
    ap.add_argument("--species", required=True, choices=["human", "mouse"])
    ap.add_argument("--data-dir", required=True)
    ap.add_argument("--gencode-gtf", required=True)
    ap.add_argument("--gencode-gff3", required=True)
    ap.add_argument("--assembly-report", required=True)
    ap.add_argument("--window", type=int, default=50000)
    args = ap.parse_args()

    releases = json.load(open(os.path.join(args.data_dir, "releases.json")))["releases"]
    release = next(r for r in releases if r["id"] == args.release)
    src = os.path.join(args.data_dir, release["species"][args.species]["dir"])
    out = os.path.join(args.data_dir, "jbrowse", args.release, args.species)
    os.makedirs(out, exist_ok=True)
    sp = args.species

    # chromosome sizes of the assembled molecules, UCSC names
    sizes = []
    for line in open(args.assembly_report):
        if line.startswith("#"):
            continue
        f = line.rstrip("\n").split("\t")
        if f[1] == "assembled-molecule" and f[9].startswith("chr"):
            sizes.append((f[9], f[8]))
    with open(os.path.join(out, "chrom.sizes"), "w") as fh:
        fh.writelines(f"{c}\t{n}\n" for c, n in sizes)
    chroms = {c for c, _ in sizes}

    # tissue sets: gene -> tissues
    tissues = collections.defaultdict(list)
    prefix = f"tusco_{sp}_"
    for name in sorted(os.listdir(src)):
        if not (name.startswith(prefix) and name.endswith(".tsv")):
            continue
        path = os.path.join(src, name)
        head = open(path).read(400)
        m = re.search(r"^# Tissue:\s*(.+)$", head, re.M)
        if not m:
            continue
        for gid in table_ids(path):
            tissues[gid].append(m.group(1).strip())
    universal = set(table_ids(os.path.join(src, f"tusco_{sp}.tsv")))

    def structures(genes, release_gtfs):
        """GTF records for genes, from the release's own GTFs where they exist, else GENCODE."""
        found, recs = set(), []
        for path in release_gtfs:
            if os.path.exists(path):
                for f, a, gid in gtf_records(path, genes):
                    if f[0] in chroms:
                        recs.append((f, a, gid))
                        found.add(gid)
        missing = genes - found
        if missing:
            recs += [(f, a, gid) for f, a, gid in gtf_records(args.gencode_gtf, missing) if f[0] in chroms]
        # one copy of each record (the same gene appears in several tissue GTFs)
        seen, uniq = set(), []
        for f, a, gid in recs:
            key = (f[0], f[2], f[3], f[4], a.get("transcript_id", [""])[0])
            if key not in seen:
                seen.add(key)
                uniq.append((f, a, gid))
        return uniq

    uni = sorted(gtf_to_gff3(structures(universal, [os.path.join(src, f"tusco_{sp}.gtf")])), key=sort_key)
    tissue_gtfs = [os.path.join(src, n) for n in sorted(os.listdir(src)) if n.startswith(prefix) and n.endswith(".gtf.gz")]
    extra = {g: {"tissue_sets": len(t), "tissues": ", ".join(sorted(t))} for g, t in tissues.items()}
    tis = sorted(gtf_to_gff3(structures(set(tissues), tissue_gtfs), extra), key=sort_key)
    for name, lines in (("tusco_universal.gff3", uni), ("tusco_tissues.gff3", tis)):
        with open(os.path.join(out, name), "w") as fh:
            fh.write("##gff-version 3\n")
            fh.writelines(l + "\n" for l in lines)

    # GENCODE genes near any TUSCO gene of this release (and of the previous release, to show what changed)
    windows = collections.defaultdict(list)
    previous = release.get("previous")
    focus = universal | set(tissues)
    if previous:
        prev = next(r for r in releases if r["id"] == previous)
        focus |= set(table_ids(os.path.join(args.data_dir, prev["species"][sp]["dir"], f"tusco_{sp}.tsv")))
    for f, a, gid in gtf_records(args.gencode_gtf, focus):
        if f[2] == "gene":
            windows[f[0]].append((int(f[3]) - args.window, int(f[4]) + args.window))
    merged = {}
    for chrom, ivs in windows.items():
        ivs.sort()
        acc = [list(ivs[0])]
        for s, e in ivs[1:]:
            if s <= acc[-1][1]:
                acc[-1][1] = max(acc[-1][1], e)
            else:
                acc.append([s, e])
        merged[chrom] = acc

    def near(chrom, s, e):
        return any(s <= we and e >= ws for ws, we in merged.get(chrom, ()))

    keep_genes, lines = set(), []
    with open_text(args.gencode_gff3) as fh:
        rows = [l.rstrip("\n").split("\t") for l in fh if not l.startswith("#")]
    for f in rows:
        if len(f) == 9 and f[2] == "gene" and near(f[0], int(f[3]), int(f[4])):
            keep_genes.add(re.search(r"ID=([^;]+)", f[8]).group(1))
    for f in rows:
        if len(f) != 9 or "Ensembl_canonical_extended" in f[8]:
            continue
        ident = re.search(r"(?:^|;)ID=([^;]+)", f[8])
        parent_gene = re.search(r"(?:^|;)gene_id=([^;]+)", f[8])
        gene = ident.group(1) if f[2] == "gene" else (parent_gene.group(1) if parent_gene else None)
        if gene in keep_genes:
            # GENCODE GFF3 has no Name attribute; label genes and transcripts by their names
            if "Name=" not in f[8]:
                key = "gene_name" if f[2] == "gene" else "transcript_name"
                m = re.search(rf"(?:^|;){key}=([^;]+)", f[8])
                if m and f[2] in ("gene", "transcript", "mRNA", "lnc_RNA", "ncRNA"):
                    f[8] = f"{f[8]};Name={m.group(1)}"
            lines.append("\t".join(f))
    lines.sort(key=sort_key)
    plain = os.path.join(out, "gencode.gff3")
    with open(plain, "w") as fh:
        fh.writelines(l + "\n" for l in lines)
    pysam.tabix_compress(plain, plain + ".gz", force=True)
    pysam.tabix_index(plain + ".gz", preset="gff", force=True)
    os.remove(plain)

    print(f"{args.release} {sp}: {len(sizes)} chromosomes, {len(universal)} universal genes "
          f"({len(uni)} GFF3 lines), {len(tissues)} tissue-set genes, {len(keep_genes)} GENCODE genes "
          f"in {sum(len(v) for v in merged.values())} windows")


if __name__ == "__main__":
    main()
