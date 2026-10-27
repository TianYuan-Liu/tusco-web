import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
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
import { Catalog, fileUrl, Release, SPECIES, SPECIES_LABEL, useCatalog, Species } from '../data/catalog';
import { useRelease } from '../context/ReleaseContext';
import { FileButton, Mono, Page, PageHeader, Panel, Section } from '../components/ui';

const FILE_NOTES: Record<string, string> = {
  'tissue_statistics.tsv': 'Genes per tissue set',
  'changes_vs_published.tsv': 'Kept, new and dropped universal genes, with reasons',
  'run_parameters.json': 'Every threshold used to build the sets',
  'gene_filter_log.tsv': 'For every candidate gene, the step that removed it',
};

const SpeciesDownloads: React.FC<{ release: Release; species: Species; catalog: Catalog | null }> = ({
  release,
  species,
  catalog,
}) => {
  const extras = catalog?.files.filter((f) => !f.startsWith(`tusco_${species}.`)) || [];
  return (
    <Panel sx={{ height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="h3" component="h3">
          {SPECIES_LABEL[species]}
        </Typography>
        <Typography variant="caption">{release.species[species].annotation[0]}</Typography>
      </Stack>

      <Typography variant="h4" component="h4" sx={{ mt: 2.5, mb: 1 }}>
        Universal set · {catalog?.universal.length ?? '–'} genes
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {catalog && <FileButton href={fileUrl(catalog, `tusco_${species}.tsv`)} label={`tusco_${species}.tsv`} primary />}
        {catalog?.files.includes(`tusco_${species}.gtf`) && (
          <FileButton href={fileUrl(catalog, `tusco_${species}.gtf`)} label={`tusco_${species}.gtf`} />
        )}
      </Stack>

      <Typography variant="h4" component="h4" sx={{ mt: 2.5, mb: 1 }}>
        Tissue sets · {catalog?.tissues.length ?? '–'} tissues
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <FileButton
          href={`/api/download/bulk/${species}?release=${release.id}`}
          label={catalog?.tissues.some((t) => t.gtf) ? 'All sets, TSV + GTF (ZIP)' : 'All sets, TSV (ZIP)'}
        />
      </Stack>

      {extras.length > 0 && (
        <>
          <Typography variant="h4" component="h4" sx={{ mt: 2.5, mb: 1 }}>
            Provenance
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {extras.map((f) => (
              <Typography component="li" variant="body2" key={f} sx={{ py: 0.25 }}>
                <Link href={catalog ? fileUrl(catalog, f) : '#'} download>
                  <Mono>{f}</Mono>
                </Link>{' '}
                <Typography component="span" variant="caption">
                  {Object.entries(FILE_NOTES).find(([k]) => f.endsWith(k))?.[1]}
                </Typography>
              </Typography>
            ))}
          </Box>
        </>
      )}
    </Panel>
  );
};

const Downloads: React.FC = () => {
  const { species } = useParams();
  const { index, release, setRelease } = useRelease();
  const human = useCatalog(release?.id || null, 'human');
  const mouse = useCatalog(release?.id || null, 'mouse');

  // Old links (/downloads/human, /downloads/mouse) scroll to that species
  useEffect(() => {
    if (species && human.data && mouse.data) document.getElementById(`downloads-${species}`)?.scrollIntoView();
  }, [species, human.data, mouse.data]);

  return (
    <Page>
      <PageHeader title="Downloads" meta={release && `Release ${release.id}`}>
        Tab-separated tables with Ensembl, RefSeq and Entrez identifiers, and GTF files with the single annotated
        transcript of each gene.
      </PageHeader>

      {release && (
        <Grid container spacing={3}>
          {SPECIES.map((s) => (
            <Grid size={{ xs: 12, md: 6 }} key={s} id={`downloads-${s}`} sx={{ scrollMarginTop: 90 }}>
              <SpeciesDownloads release={release} species={s} catalog={s === 'human' ? human.data : mouse.data} />
            </Grid>
          ))}
        </Grid>
      )}

      <Section title="File format">
        <Panel>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Every TSV has one row per gene and these columns (lines starting with # are comments):
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {[
                  ['Gene_ID', 'Ensembl gene', 'ENSG00000165572'],
                  ['Transcript_ID', 'Ensembl transcript (the single isoform)', 'ENST00000379485'],
                  ['Gene_Symbol', 'HGNC / MGI symbol', 'KBTBD6'],
                  ['EntrezGene_ID', 'NCBI Gene', '89890'],
                  ['RefSeq_mRNA_ID', 'RefSeq transcript', 'NM_152903'],
                  ['RefSeq_Protein_ID', 'RefSeq protein', 'NP_690867'],
                ].map(([col, what, ex]) => (
                  <TableRow key={col}>
                    <TableCell>
                      <Mono>{col}</Mono>
                    </TableCell>
                    <TableCell>{what}</TableCell>
                    <TableCell>
                      <Mono>{ex}</Mono>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Files of the paper release keep their original addresses, for example{' '}
            <Mono wrap>https://tusco.uv.es/data/human/tusco_human.tsv</Mono>. Newer releases live under{' '}
            <Mono wrap>/data/releases/&lt;release&gt;/</Mono>.
          </Typography>
        </Panel>
      </Section>

      {index && (
        <Section title="All releases">
          <Panel padded={false}>
            <TableContainer>
              <Table aria-label="Releases">
                <TableHead>
                  <TableRow>
                    <TableCell>Release</TableCell>
                    <TableCell>Human</TableCell>
                    <TableCell>Mouse</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {index.releases.map((r) => (
                    <TableRow key={r.id} selected={r.id === release?.id}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 650 }}>{r.id}</Typography>
                        <Typography variant="caption">{r.name}</Typography>
                        {r.id === index.current && <Chip label="current" size="small" color="primary" sx={{ ml: 1, height: 20 }} />}
                      </TableCell>
                      <TableCell>{r.species.human.annotation.slice(0, 1).join(', ')}</TableCell>
                      <TableCell>{r.species.mouse.annotation.slice(0, 1).join(', ')}</TableCell>
                      <TableCell align="right">
                        {r.id !== release?.id && (
                          <Button size="small" onClick={() => setRelease(r.id)}>
                            Show files
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Panel>
        </Section>
      )}
    </Page>
  );
};

export default Downloads;
