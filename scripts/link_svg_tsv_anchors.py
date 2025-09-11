#!/usr/bin/env python3
"""
Link SVG label <text> nodes to TSV files with download anchors.

Behavior:
- For each <text> in data/human_body_map.svg and data/mouse_body_map.svg,
  if a matching TSV exists under data/{species}/tusco_{species}_{normalized}.tsv,
  wrap the <text> in an <a> with xlink:href="/data/{species}/..." and download attribute.
- If no specific subregion TSV exists, fall back to organ-level by splitting at ' - '.
- If still no match, leave the label unmodified.
- Do not change transforms, coordinates, or styles; only wrap in <a>.

This script is idempotent: rerunning will update anchors or leave already-wrapped labels intact.
"""

from __future__ import annotations

import os
import re
import sys
import shutil
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

SVG_NS = "http://www.w3.org/2000/svg"
XLINK_NS = "http://www.w3.org/1999/xlink"
NSMAP = {
    'svg': SVG_NS,
    'xlink': XLINK_NS,
}

# Register namespaces so ET writes cleaner tags
ET.register_namespace('', SVG_NS)
ET.register_namespace('xlink', XLINK_NS)


def text_content(elem: ET.Element) -> str:
    """Concatenate text and tail from element and its descendants."""
    parts: list[str] = []
    for t in elem.iter():
        if t.text:
            parts.append(t.text)
        if t.tail:
            parts.append(t.tail)
    return ''.join(parts)


def normalize_label(label: str) -> str:
    # Remove trailing counts like " (67)" at end
    label = re.sub(r"\s*\([^)]*\)\s*$", "", label)
    # Harmonize dashes
    label = label.replace('\u2013', '-').replace('\u2014', '-').replace('\u2212', '-')
    label = label.strip().lower()
    # Collapse multi-line labels to single space
    label = re.sub(r"\s+", " ", label)
    return label


def to_filename_piece(norm_label: str) -> str:
    # Convert spaces to underscores and drop non-alphanumeric/underscore
    s = re.sub(r"[^a-z0-9\s_-]", "", norm_label)
    s = s.replace('-', ' ')
    s = re.sub(r"\s+", "_", s).strip('_')
    return s


def build_available(species: str) -> set[str]:
    base = ROOT / 'data' / species
    avail: set[str] = set()
    if not base.exists():
        return avail
    for f in base.iterdir():
        name = f.name
        if not name.endswith('.tsv'):
            continue
        if not name.startswith(f"tusco_{species}_"):
            continue
        tissue = name[len(f"tusco_{species}_"): -4]  # strip prefix + .tsv
        avail.add(tissue)
    return avail


def find_match(species: str, label: str, avail: set[str]) -> str | None:
    """Return filename (basename) for the best match or None.

    Matching order:
    1) Exact normalized match
    2) Fallback to organ-level by splitting at ' - '
    """
    nl = normalize_label(label)
    if not nl:
        return None
    piece = to_filename_piece(nl)
    exact = f"tusco_{species}_{piece}.tsv"
    if piece in avail:
        return exact
    # Fallback to organ-level (before hyphen)
    if ' - ' in nl:
        base = nl.split(' - ', 1)[0].strip()
        base_piece = to_filename_piece(base)
        if base_piece in avail:
            return f"tusco_{species}_{base_piece}.tsv"
    return None


def ensure_xlink_ns(root: ET.Element) -> None:
    # Ensure xmlns:xlink present
    if f"{{{ET._namespace_map.get('xlink', XLINK_NS)}}}href" or True:
        # xml.etree doesn't expose names easily; set attribute if missing
        has = any(attr for attr in root.attrib if attr.endswith('}xlink'))
    # Safer: set attrib if not present
    if 'xmlns:xlink' not in root.attrib:
        root.set('xmlns:xlink', XLINK_NS)


def wrap_text_with_anchor(text_elem: ET.Element, species: str, filename: str) -> None:
    parent = text_elem.getparent() if hasattr(text_elem, 'getparent') else None
    # xml.etree.ElementTree does not provide getparent; replace by manual approach.
    # We'll recreate a new <a> and replace the text_elem in its parent.children list.
    a = ET.Element(f"{{{SVG_NS}}}a")
    a.set(f"{{{XLINK_NS}}}href", f"/data/{species}/{filename}")
    a.set('download', filename)
    # Preserve sibling order: we'll do replacement using parent
    # But ElementTree stdlib lacks parent reference; we need to find parent manually.
    # We'll traverse from root later; here we just create wrapper.
    # Instead of using separate helper, we implement replacement in caller.
    return


def process_svg(svg_path: Path, species: str, avail: set[str]) -> dict:
    # Backup original once
    backup_path = svg_path.with_suffix(svg_path.suffix + '.bak')
    if not backup_path.exists():
        shutil.copyfile(svg_path, backup_path)

    # Parse XML
    parser = ET.XMLParser()
    tree = ET.parse(svg_path, parser=parser)
    root = tree.getroot()
    ensure_xlink_ns(root)

    changed = 0
    processed = 0
    matched = 0
    skipped = 0
    unmatched_labels: list[str] = []

    # We need to wrap <text> elements with anchors. Because ElementTree doesn't provide parent,
    # iterate over all parents and rebuild children lists when needed.
    def iter_with_parents(elem: ET.Element, parent: ET.Element | None = None):
        for child in list(elem):
            yield elem, child
            yield from iter_with_parents(child, elem)

    for parent, child in list(iter_with_parents(root)):
        if child.tag != f"{{{SVG_NS}}}text":
            continue
        processed += 1
        # Compute human-readable label text
        label = ''.join(child.itertext()).strip()
        if not label:
            continue
        filename = find_match(species, label, avail)

        # Check if already wrapped in an <a>
        already_anchored = parent.tag == f"{{{SVG_NS}}}a"
        a_parent = parent if already_anchored else None
        if filename:
            matched += 1
            if already_anchored:
                # Update attributes on existing <a>
                a_parent.set(f"{{{XLINK_NS}}}href", f"/data/{species}/{filename}")
                a_parent.set('download', filename)
                changed += 1
            else:
                # Create anchor and wrap
                a = ET.Element(f"{{{SVG_NS}}}a")
                a.set(f"{{{XLINK_NS}}}href", f"/data/{species}/{filename}")
                a.set('download', filename)
                # Replace child in parent
                idx = list(parent).index(child)
                parent.remove(child)
                a.append(child)
                parent.insert(idx, a)
                changed += 1
        else:
            # No match: leave unmodified
            skipped += 1
            # If already anchored erroneously, we could consider unwrapping, but spec says leave
            # unmatched unchanged, so do nothing.
            unmatched_labels.append(label)

    tree.write(svg_path, encoding='utf-8', xml_declaration=True)

    return {
        'processed': processed,
        'matched': matched,
        'changed': changed,
        'skipped': skipped,
        'unmatched': unmatched_labels,
    }


def main() -> int:
    human_svg = ROOT / 'data' / 'human_body_map.svg'
    mouse_svg = ROOT / 'data' / 'mouse_body_map.svg'

    human_avail = build_available('human')
    mouse_avail = build_available('mouse')

    report = {}
    if human_svg.exists():
        report['human'] = process_svg(human_svg, 'human', human_avail)
    if mouse_svg.exists():
        report['mouse'] = process_svg(mouse_svg, 'mouse', mouse_avail)

    # Print concise summary
    for sp in ('human', 'mouse'):
        if sp in report:
            r = report[sp]
            print(f"[{sp}] processed={r['processed']} matched={r['matched']} changed={r['changed']} skipped={r['skipped']}")

    return 0


if __name__ == '__main__':
    raise SystemExit(main())

