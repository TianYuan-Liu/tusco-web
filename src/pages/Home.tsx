import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Grid,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useCatalog, SPECIES, SPECIES_LABEL, fileUrl, inSentence } from '../data/catalog';
import { useRelease, useReleaseLink } from '../context/ReleaseContext';
import FunnelTable from '../components/FunnelTable';
import { Mono, Page, Section } from '../components/ui';

const ARTICLE = 'https://doi.org/10.1038/s41467-026-72089-1';

const Home: React.FC = () => {
  const link = useReleaseLink();
  const { release, previous, isCurrent, index, setRelease } = useRelease();
  const human = useCatalog(release?.id || null, 'human');
  const mouse = useCatalog(release?.id || null, 'mouse');
  const catalogs = { human: human.data, mouse: mouse.data };
  const changed = (s: 'human' | 'mouse') => catalogs[s]?.dropped.length ?? 0;

  return (
    <Page>
      <Box sx={{ maxWidth: 780 }}>
        <Typography variant="h1">TUSCO</Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
          Transcriptome Universal Single-isoform COntrol
        </Typography>
        <Typography variant="body1" sx={{ mt: 2.5 }}>
          TUSCO genes have a single annotated isoform in GENCODE, RefSeq and MANE, show no alternative splicing or
          transcription start sites in population data, and are expressed across tissues. In a long-read
          transcriptome, any other isoform reconstructed at a TUSCO gene is an error, and a TUSCO gene that is not
          recovered is a missed transcript. This gives each sample an internal benchmark without spike-ins (
          <Link href={ARTICLE} target="_blank" rel="noopener noreferrer">
            Liu et al., Nature Communications 2026
          </Link>
          ).
        </Typography>
      </Box>

      {release && !isCurrent && index && (
        <Alert
          severity="info"
          sx={{ mt: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setRelease(index.current)}>
              Show current
            </Button>
          }
        >
          You are viewing the {inSentence(release.name)} ({release.id}). The current release is {index.current}.
        </Alert>
      )}

      {release && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
            Gene sets in release {release.id}
          </Typography>
          <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Table aria-label="Gene sets in this release">
              <TableHead>
                <TableRow>
                  <TableCell>Species</TableCell>
                  <TableCell>Annotation</TableCell>
                  <TableCell align="right">Universal genes</TableCell>
                  <TableCell align="right">Tissue sets</TableCell>
                  <TableCell>Files</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {SPECIES.map((s) => {
                  const c = catalogs[s];
                  return (
                    <TableRow key={s}>
                      <TableCell>
                        <Link component={RouterLink} to={link(`/explore/${s}`)} sx={{ fontWeight: 600 }}>
                          {SPECIES_LABEL[s]}
                        </Link>
                      </TableCell>
                      <TableCell>{release.species[s].annotation[0]}</TableCell>
                      <TableCell align="right">{c?.universal.length ?? '–'}</TableCell>
                      <TableCell align="right">{c?.tissues.length ?? '–'}</TableCell>
                      <TableCell>
                        {c && (
                          <Stack direction="row" spacing={1.5}>
                            <Link href={fileUrl(c, `tusco_${s}.tsv`)} download>
                              TSV
                            </Link>
                            {c.files.includes(`tusco_${s}.gtf`) && (
                              <Link href={fileUrl(c, `tusco_${s}.gtf`)} download>
                                GTF
                              </Link>
                            )}
                            <Link href={`/api/download/bulk/${s}?release=${c.release}`}>tissue sets (ZIP)</Link>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {previous && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 780 }}>
              Release {release.id} is built on {release.species.human.annotation[0]} and{' '}
              {release.species.mouse.annotation[0]}. GENCODE now annotates further isoforms for {changed('human')} human
              and {changed('mouse')} mouse genes of the {inSentence(previous.name)}, so they were removed; thresholds
              were relaxed to replace them and to add multi-exon genes.{' '}
              <Link component={RouterLink} to={link('/releases')}>
                What changed
              </Link>
            </Typography>
          )}
        </Box>
      )}

      <Section
        title="Selection"
        subtitle="Genes left after each filter in this release. The Method page describes the filters."
      >
        <Grid container spacing={{ xs: 3, md: 6 }}>
          {SPECIES.map((s) => (
            <Grid size={{ xs: 12, md: 6 }} key={s}>
              <Typography variant="h4" component="h3" sx={{ mb: 0.5 }}>
                {SPECIES_LABEL[s]}
              </Typography>
              {release && <FunnelTable steps={release.species[s].funnel} />}
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section title="Using TUSCO">
        <Box component="ol" sx={{ m: 0, pl: 2.5, maxWidth: 780, '& li': { mb: 1.5 } }}>
          <li>
            <Typography variant="body1">
              <strong>Universal set.</strong> For any sample: map the reconstructed transcripts to the TUSCO genes and
              count the genes found as their single annotated isoform, those found with other isoforms, and those
              missing.{' '}
              <Link component={RouterLink} to={link('/downloads')}>
                Downloads
              </Link>
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Tissue sets.</strong> For a sample of known tissue: larger sets of genes expressed in that tissue
              (GTEx for human, Bgee and ENCODE for mouse) that pass the same single-isoform filters.{' '}
              <Link component={RouterLink} to={link('/explore/human')}>
                Browse tissues
              </Link>
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>SQANTI3.</strong> SQANTI3 6 reports TUSCO metrics with <Mono>--tusco human</Mono> or{' '}
              <Mono>--tusco mouse</Mono>, using the gene lists of the paper release.{' '}
              <Link href="https://conesalab.github.io/SQANTI3/latest/Tusco-quick-start" target="_blank" rel="noopener noreferrer">
                Quick start
              </Link>
            </Typography>
          </li>
        </Box>
      </Section>
    </Page>
  );
};

export default Home;
