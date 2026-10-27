import React from 'react';
import {
  Box,
  Button,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Release, SPECIES, SPECIES_LABEL, useCatalog, Species } from '../data/catalog';
import { useRelease } from '../context/ReleaseContext';
import { Mono, NewChip, Page, PageHeader, Panel, Section } from '../components/ui';

const Comparison: React.FC<{ release: Release; previous: Release; species: Species }> = ({ release, previous, species }) => {
  const { data: catalog } = useCatalog(release.id, species);
  if (!catalog) return null;
  const added = catalog.universal.filter((g) => g.status === 'new');
  const kept = catalog.universal.filter((g) => g.status === 'kept');
  const rows = [
    ...catalog.added.map((g) => ({ ...g, status: 'new' as const })),
    ...catalog.dropped.map((g) => ({ ...g, status: 'dropped' as const })),
  ];

  return (
    <Box>
      <Typography variant="h3" component="h3" sx={{ mb: 1.5 }}>
        {SPECIES_LABEL[species]}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {kept.length} of the {kept.length + catalog.dropped.length} genes of {previous.id} kept, {catalog.dropped.length}{' '}
        dropped, {added.length} new.
      </Typography>
      <Panel padded={false}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size="small" stickyHeader aria-label={`${SPECIES_LABEL[species]} universal genes added or dropped`}>
            <TableHead>
              <TableRow>
                <TableCell>Gene</TableCell>
                <TableCell>Change</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 650 }}>
                      {r.symbol}
                    </Typography>
                    <Mono>{r.id}</Mono>
                  </TableCell>
                  <TableCell>
                    {r.status === 'new' ? (
                      <NewChip />
                    ) : (
                      <Typography component="span" variant="caption">
                        dropped
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', minWidth: 220 }}>
                    {r.note.charAt(0).toUpperCase() + r.note.slice(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Panel>
    </Box>
  );
};

const Releases: React.FC = () => {
  const { index, release: selected, setRelease } = useRelease();
  if (!index) return null;
  const current = index.releases.find((r) => r.id === index.current)!;
  const previous = index.releases.find((r) => r.id === current.previous) || null;

  return (
    <Page>
      <PageHeader title="Releases">
        TUSCO is rebuilt when the annotations it relies on change. Older releases stay available so that published
        benchmarks can be reproduced.
      </PageHeader>

      <Box component="dl" sx={{ m: 0, borderTop: 1, borderColor: 'divider' }}>
        {index.releases.map((r) => (
          <Box key={r.id} sx={{ py: 2.5, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
              <Box sx={{ maxWidth: 780 }}>
                <Box component="dt">
                  <Typography variant="h3" component="h2">
                    {r.id} · {r.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {r.id === index.current && ' · current release'}
                    {' · '}
                    {SPECIES.map((s) => `${SPECIES_LABEL[s]}: ${r.species[s].annotation[0]}`).join(', ')}
                  </Typography>
                </Box>
                <Box component="dd" sx={{ m: 0, mt: 1 }}>
                  <Typography variant="body1">{r.summary}</Typography>
                </Box>
              </Box>
              <Box sx={{ flexShrink: 0 }}>
                {r.id === selected?.id ? (
                  <Typography variant="body2" color="text.secondary">
                    Shown on this site
                  </Typography>
                ) : (
                  <Button variant="outlined" size="small" onClick={() => setRelease(r.id)}>
                    Show this release
                  </Button>
                )}
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>

      {previous && (
        <Section
          title={`Universal genes: ${current.id} vs ${previous.id}`}
          subtitle="GENCODE v50 and vM39 added long-read (TAGENE) transcripts to many genes, which are then no longer single-isoform. New genes enter through the relaxed thresholds listed on the Method page."
        >
          <Grid container spacing={4}>
            {SPECIES.map((s) => (
              <Grid size={{ xs: 12, md: 6 }} key={s}>
                <Comparison release={current} previous={previous} species={s} />
              </Grid>
            ))}
          </Grid>
        </Section>
      )}
    </Page>
  );
};

export default Releases;
