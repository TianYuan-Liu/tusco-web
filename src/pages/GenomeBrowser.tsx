// Genome browser (JBrowse 2 linear genome view). Loaded on demand: JBrowse is large.
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Grid,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
} from '@mui/material';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { createViewState, JBrowseLinearGenomeView } from '@jbrowse/react-linear-genome-view2';
import { Release, Species, SPECIES_LABEL, useCatalog, inSentence } from '../data/catalog';
import { useRelease, useReleaseLink } from '../context/ReleaseContext';
import { Page, PageHeader, Panel, SpeciesSwitch } from '../components/ui';
import { fontStack } from '../theme';

const ASSEMBLY: Record<Species, string> = { human: 'GRCh38', mouse: 'GRCm39' };

interface Locus {
  id: string;
  name: string;
  chrom: string;
  start: number;
  end: number;
  group: 'universal' | 'tissue' | 'removed';
}

// Genes of the tissue-set track, for the search box (the catalog has coordinates for universal genes only)
function useTissueLoci(url: string | null): Locus[] {
  const [loci, setLoci] = useState<Locus[]>([]);
  useEffect(() => {
    if (!url) return;
    let live = true;
    fetch(url)
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => {
        if (!live) return;
        const out: Locus[] = [];
        for (const line of text.split('\n')) {
          const f = line.split('\t');
          if (f.length < 9 || f[2] !== 'gene') continue;
          const id = (f[8].match(/(?:^|;)ID=([^;]+)/) || [])[1] || '';
          const name = decodeURIComponent((f[8].match(/(?:^|;)Name=([^;]+)/) || [])[1] || id);
          out.push({ id, name, chrom: f[0], start: +f[3], end: +f[4], group: 'tissue' });
        }
        setLoci(out);
      })
      .catch(() => live && setLoci([]));
    return () => {
      live = false;
    };
  }, [url]);
  return loci;
}

const locString = (l: Locus) => {
  const pad = Math.max(5000, Math.round((l.end - l.start) * 0.6));
  return `${l.chrom}:${Math.max(1, l.start - pad)}-${l.end + pad}`;
};

function buildState(release: Release, previous: Release | null, species: Species, location: string) {
  const origin = window.location.origin;
  const base = `${origin}/data/jbrowse/${release.id}/${species}`;
  const assembly = ASSEMBLY[species];
  const uri = (u: string) => ({ uri: u, locationType: 'UriLocation' });
  // compact feature displays: TUSCO genes in teal, GENCODE in grey so TUSCO genes stand out
  const display = (trackId: string, height: number, color: string, utr: string) => [
    {
      type: 'LinearBasicDisplay',
      displayId: `${trackId}-display`,
      height,
      renderer: { type: 'SvgFeatureRenderer', color1: color, color3: utr },
    },
  ];
  const gff = (trackId: string, name: string, url: string) => ({
    type: 'FeatureTrack',
    trackId,
    name,
    category: ['TUSCO'],
    assemblyNames: [assembly],
    adapter: { type: 'Gff3Adapter', gffLocation: uri(url) },
    displays: display(trackId, 64, '#11948a', '#8fc9c3'),
  });
  const tracks: Record<string, unknown>[] = [
    gff('tusco_universal', `TUSCO universal genes (release ${release.id})`, `${base}/tusco_universal.gff3`),
    gff('tusco_tissues', `TUSCO tissue-set genes (release ${release.id})`, `${base}/tusco_tissues.gff3`),
  ];
  if (previous) {
    tracks.push(
      gff(
        'tusco_previous',
        `TUSCO universal genes (${inSentence(previous.name)} ${previous.id})`,
        `${origin}/data/jbrowse/${previous.id}/${species}/tusco_universal.gff3`
      )
    );
  }
  tracks.push({
    type: 'FeatureTrack',
    trackId: 'gencode',
    name: `${release.species[species].annotation[0]} (genes within 50 kb of a TUSCO gene)`,
    category: ['Annotation'],
    assemblyNames: [assembly],
    adapter: {
      type: 'Gff3TabixAdapter',
      gffGzLocation: uri(`${base}/gencode.gff3.gz`),
      index: { location: uri(`${base}/gencode.gff3.gz.tbi`) },
    },
    displays: display('gencode', 260, '#6f747a', '#c9ccd1'),
  });

  const state = createViewState({
    assembly: {
      name: assembly,
      sequence: {
        type: 'ReferenceSequenceTrack',
        trackId: `${assembly}-chromosomes`,
        // chromosome lengths only: no sequence is served
        adapter: { type: 'ChromSizesAdapter', chromSizesLocation: uri(`${base}/chrom.sizes`) },
      },
    },
    tracks: tracks as any,
    location,
    configuration: {
      rpc: { defaultDriver: 'MainThreadRpcDriver' },
      theme: {
        typography: { fontFamily: fontStack },
        palette: {
          primary: { main: '#0e7c75' },
          secondary: { main: '#4b4f53' },
          tertiary: { main: '#11948a' },
          quaternary: { main: '#c7325a' },
        },
      },
    },
  });
  const view = state.session.view as any;
  for (const t of tracks) view.showTrack(t.trackId as string);
  return state;
}

const GenomeBrowser: React.FC = () => {
  const { species } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const link = useReleaseLink();
  const { release, previous } = useRelease();
  const sp = (species === 'mouse' ? 'mouse' : 'human') as Species;
  const { data: catalog } = useCatalog(release?.id || null, sp);
  const { data: previousCatalog } = useCatalog(previous?.id || null, sp);
  const tissueLoci = useTissueLoci(release ? `/data/jbrowse/${release.id}/${sp}/tusco_tissues.gff3` : null);
  const [query, setQuery] = useState('');

  const universal: Locus[] = useMemo(
    () =>
      (catalog?.universal || [])
        .filter((g) => g.chrom && g.start && g.end)
        .map((g) => ({ id: g.id, name: g.symbol || g.id, chrom: g.chrom, start: g.start!, end: g.end!, group: 'universal' as const }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [catalog]
  );
  const removed: Locus[] = useMemo(() => {
    const ids = new Set((catalog?.dropped || []).map((d) => d.id));
    return (previousCatalog?.universal || [])
      .filter((g) => ids.has(g.id) && g.chrom && g.start && g.end)
      .map((g) => ({ id: g.id, name: g.symbol || g.id, chrom: g.chrom, start: g.start!, end: g.end!, group: 'removed' as const }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog, previousCatalog]);
  const all = useMemo(() => {
    const seen = new Set(universal.map((l) => l.id).concat(removed.map((l) => l.id)));
    return [...universal, ...removed, ...tissueLoci.filter((l) => !seen.has(l.id))];
  }, [universal, removed, tissueLoci]);

  const requested = params.get('gene');
  const target =
    all.find((l) => l.id === requested || l.name === requested) || (requested ? undefined : universal[0]) || undefined;

  // One view per release and species; later gene choices only move it
  const [state, setState] = useState<ReturnType<typeof createViewState> | null>(null);
  const ready = !!release && !!catalog && universal.length > 0;
  useEffect(() => {
    if (!ready || !release) return;
    setState(buildState(release, previous, sp, target ? locString(target) : `${universal[0].chrom}:1-100000`));
    // the initial location only; navigation is handled below
    // eslint-disable-next-line
  }, [ready, release?.id, previous?.id, sp]);
  useEffect(() => {
    if (state && target) (state.session.view as any).navToLocString(locString(target));
  }, [state, target]);

  const select = (l: Locus) => {
    const next = new URLSearchParams(params);
    next.set('gene', l.id);
    setParams(next, { replace: true });
  };

  const q = query.trim().toLowerCase();
  const matches = (l: Locus) => !q || l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
  const groups: { title: string; items: Locus[] }[] = [
    { title: 'Universal genes', items: universal.filter(matches) },
    ...(previous && removed.length ? [{ title: `Removed since release ${previous.id}`, items: removed.filter(matches) }] : []),
    ...(q ? [{ title: 'Tissue-set genes', items: tissueLoci.filter((l) => matches(l) && !universal.some((u) => u.id === l.id)).slice(0, 50) }] : []),
  ];

  return (
    <Page>
      <PageHeader
        title="Genome browser"
        meta={
          release && (
            <>
              Release {release.id} · {ASSEMBLY[sp]} · {release.species[sp].annotation[0]}. Chromosome coordinates only; no
              sequence is shown.
            </>
          )
        }
        actions={<SpeciesSwitch value={sp} onChange={(s) => navigate(link(`/browser/${s}`))} />}
      />

      {!ready && <LinearProgress />}
      {requested && ready && !target && <Alert severity="warning" sx={{ mb: 2 }}>{requested} is not a TUSCO gene of this release.</Alert>}

      {ready && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Panel padded={false}>
              <Box sx={{ p: 1.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Find a TUSCO gene"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  inputProps={{ 'aria-label': 'Find a TUSCO gene' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <List dense sx={{ maxHeight: 620, overflowY: 'auto', pt: 0 }} subheader={<li />}>
                {groups.map((g) => (
                  <li key={g.title}>
                    <ul style={{ padding: 0 }}>
                      <ListSubheader sx={{ lineHeight: '32px', fontSize: '0.78rem' }}>
                        {g.title} ({g.items.length})
                      </ListSubheader>
                      {g.items.map((l) => (
                        <ListItemButton key={`${g.title}-${l.id}`} selected={target?.id === l.id} onClick={() => select(l)}>
                          <ListItemText
                            primary={l.name}
                            secondary={`${l.chrom}:${l.start.toLocaleString('en-US')}`}
                            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                            secondaryTypographyProps={{ fontSize: '0.74rem', fontFamily: 'ui-monospace, Menlo, monospace' }}
                          />
                        </ListItemButton>
                      ))}
                    </ul>
                  </li>
                ))}
              </List>
            </Panel>
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: '#ffffff' }}>
              {state && <JBrowseLinearGenomeView viewState={state} />}
            </Box>
            <Typography variant="caption" component="p" sx={{ mt: 1 }}>
              Tracks: TUSCO universal and tissue-set genes{previous ? `, the universal genes of release ${previous.id}` : ''},
              and {release!.species[sp].annotation[0]} genes near them (from the full GENCODE annotation; other regions
              of the genome are not loaded). Drag to move, scroll or use the zoom buttons to zoom.
            </Typography>
          </Grid>
        </Grid>
      )}
    </Page>
  );
};

export default GenomeBrowser;
