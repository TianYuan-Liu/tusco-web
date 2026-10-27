import React from 'react';
import { Box, Chip, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { inSentence, SPECIES, SPECIES_LABEL } from '../data/catalog';
import { useRelease } from '../context/ReleaseContext';
import FunnelTable from '../components/FunnelTable';
import { Page, PageHeader, Panel, Section } from '../components/ui';

const STEPS = [
  {
    title: 'One isoform in every annotation',
    text: 'The gene has a single transcript in GENCODE and in RefSeq (and, for human, MANE Select), with the same exons and introns in all of them. Ensembl and RefSeq identifiers are linked through Ensembl BioMart.',
  },
  {
    title: 'No alternative start sites or splice junctions',
    text: 'Population RNA-seq junctions from recount3 must not show a novel junction above a fraction of the annotated junction coverage (1% in human, 5% in mouse), and refTSS CAGE peaks must not point to a second transcription start site.',
  },
  {
    title: 'No alternative splicing in IntroVerse (human)',
    text: 'Genes with alternative splicing events catalogued by IntroVerse are removed.',
  },
  {
    title: 'Expressed across tissues',
    text: 'Bgee must call the gene present in most tissues with at least 25,000 expressed genes, or the HRT Atlas lists it as a housekeeping gene. AlphaGenome predictions must also show expression across tissues and no unannotated splicing. From release 2026.10, a gene without an AlphaGenome prediction is not removed for that reason; it needs a median Bgee expression score of at least 55 in those tissues instead.',
  },
  {
    title: 'Curated exclusion list',
    text: 'A short list of genes found to be problematic by manual review is removed.',
  },
];

const Method: React.FC = () => {
  const { release, previous } = useRelease();

  return (
    <Page>
      <PageHeader title="Method" meta={release && `Release ${release.id}`}>
        Every step removes genes with evidence for a second isoform, so that any other isoform reported at a TUSCO gene
        can be counted as an error. Tissue sets use the same filters, with expression required in one tissue instead of
        across tissues.
      </PageHeader>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {STEPS.map((s, i) => (
              <Box component="li" key={s.title} sx={{ display: 'flex', gap: 2, pb: 3 }}>
                <Typography sx={{ width: 22, flexShrink: 0, fontWeight: 600, color: 'text.secondary' }}>{i + 1}.</Typography>
                <Box>
                  <Typography variant="h4" component="h3">
                    {s.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {s.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            {release &&
              SPECIES.map((s) => (
                <Panel key={s}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                    <Typography variant="h4" component="h3">
                      {SPECIES_LABEL[s]}: genes left after each step
                    </Typography>
                    <Typography variant="caption">release {release.id}</Typography>
                  </Stack>
                  <FunnelTable
                    steps={release.species[s].funnel}
                    previous={previous?.species[s].funnel}
                    previousLabel={previous?.name}
                  />
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                    {[...release.species[s].annotation, ...release.species[s].expression].map((src) => (
                      <Chip key={src} label={src} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Panel>
              ))}
          </Stack>
        </Grid>
      </Grid>

      {release && previous && (
        <Section
          title={`Settings changed in release ${release.id}`}
          subtitle={`Compared with the ${inSentence(previous.name)} (${previous.id}). Settings not listed are unchanged.`}
        >
          <Grid container spacing={3}>
            {SPECIES.map((s) => (
              <Grid size={{ xs: 12, md: 6 }} key={s}>
                <Panel padded={false}>
                  <Typography variant="h4" component="h3" sx={{ p: 2, pb: 1 }}>
                    {SPECIES_LABEL[s]}
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Setting</TableCell>
                          <TableCell>{release.id}</TableCell>
                          <TableCell>{previous.id}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {release.species[s].settings
                          .filter((x) => x.value !== x.previous)
                          .map((x) => (
                            <TableRow key={x.name}>
                              <TableCell sx={{ fontWeight: 600 }}>{x.name}</TableCell>
                              <TableCell>{x.value}</TableCell>
                              <TableCell sx={{ color: 'text.secondary' }}>{x.previous}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Panel>
              </Grid>
            ))}
          </Grid>
        </Section>
      )}
    </Page>
  );
};

export default Method;
