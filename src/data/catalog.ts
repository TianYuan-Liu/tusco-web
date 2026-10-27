import { useEffect, useState } from 'react';

export type Species = 'human' | 'mouse';
export const SPECIES: Species[] = ['human', 'mouse'];
export const SPECIES_LABEL: Record<Species, string> = { human: 'Human', mouse: 'Mouse' };

export interface FunnelStep {
  step: string;
  n: number;
}

export interface Setting {
  name: string;
  value: string;
  previous: string;
}

export interface ReleaseSpecies {
  dir: string;
  annotation: string[];
  expression: string[];
  funnel: FunnelStep[];
  changes: string | null;
  settings: Setting[];
}

export interface Release {
  id: string;
  name: string;
  date: string;
  previous: string | null;
  summary: string;
  species: Record<Species, ReleaseSpecies>;
}

export interface ReleaseIndex {
  current: string;
  releases: Release[];
}

export interface UniversalGene {
  id: string;
  transcript: string;
  symbol: string;
  entrez: string;
  refseqMrna: string;
  refseqProtein: string;
  chrom: string;
  start: number | null;
  end: number | null;
  strand: string;
  exons: number | null;
  tissues: number;
  status: 'kept' | 'new' | null;
}

export interface Tissue {
  name: string;
  slug: string;
  n: number;
  previous: number | null;
  tsv: string;
  gtf: string | null;
}

export interface Catalog {
  release: string;
  species: Species;
  universal: UniversalGene[];
  added: { id: string; symbol: string; note: string }[];
  dropped: { id: string; symbol: string; note: string }[];
  tissues: Tissue[];
  removedTissues: string[];
  files: string[];
  base: string;
}

export interface TissueGene {
  id: string;
  transcript: string;
  symbol: string;
  entrez: string;
  refseqMrna: string;
  refseqProtein: string;
}

// One request per URL for the lifetime of the page
const cache = new Map<string, Promise<unknown>>();

function fetchCached<T>(url: string, parse: (r: Response) => Promise<T>): Promise<T> {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
        return parse(r);
      })
    );
  }
  return cache.get(url) as Promise<T>;
}

export function parseGeneTable(text: string): TissueGene[] {
  return text
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('Gene_ID'))
    .map((l) => {
      const f = l.split('\t');
      return {
        id: f[0],
        transcript: f[1] || '',
        symbol: f[2] || '',
        entrez: f[3] || '',
        refseqMrna: f[4] || '',
        refseqProtein: f[5] || '',
      };
    });
}

interface Async<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

function useAsync<T>(load: (() => Promise<T>) | null, key: string): Async<T> {
  const [state, setState] = useState<Async<T>>({ data: null, error: null, loading: !!load });
  useEffect(() => {
    if (!load) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    let live = true;
    // Keep the previous data on screen while the next one loads (no layout jump)
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((data) => live && setState({ data, error: null, loading: false }))
      .catch((e) => live && setState({ data: null, error: String(e.message || e), loading: false }));
    return () => {
      live = false;
    };
  }, [key]);
  return state;
}

export const fetchReleaseIndex = () => fetchCached<ReleaseIndex>('/data/releases.json', (r) => r.json());

export function useCatalog(release: string | null, species: Species) {
  const url = release ? `/data/catalog/${release}/${species}.json` : '';
  return useAsync<Catalog>(release ? () => fetchCached<Catalog>(url, (r) => r.json()) : null, url);
}

export function useTissueGenes(catalog: Catalog | null, tissue: Tissue | null) {
  const url = catalog && tissue ? `${catalog.base}/${encodeURIComponent(tissue.tsv)}` : '';
  return useAsync<TissueGene[]>(
    url ? () => fetchCached<TissueGene[]>(url, async (r) => parseGeneTable(await r.text())) : null,
    url
  );
}

// Release name inside a sentence: "Paper release" -> "paper release", "GENCODE v50 update" unchanged
export const inSentence = (name: string) =>
  name.length > 1 && name[1] === name[1].toLowerCase() ? name[0].toLowerCase() + name.slice(1) : name;

export const fileUrl = (catalog: Catalog, file: string) => `${catalog.base}/${encodeURIComponent(file)}`;

export const formatLocus = (g: UniversalGene) =>
  g.chrom && g.start ? `${g.chrom}:${g.start.toLocaleString('en-US')}-${g.end?.toLocaleString('en-US')}` : '';
