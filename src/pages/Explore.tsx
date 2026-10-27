import React from 'react';
import { Link as RouterLink, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, LinearProgress, Link, Stack, Typography } from '@mui/material';
import { fileUrl, inSentence, Species, SPECIES_LABEL, useCatalog } from '../data/catalog';
import { useRelease, useReleaseLink } from '../context/ReleaseContext';
import GeneTable from '../components/GeneTable';
import TissueExplorer from '../components/TissueExplorer';
import { Figures, FileButton, Page, PageHeader, Panel, Section, SpeciesSwitch } from '../components/ui';

const Explore: React.FC = () => {
  const { species } = useParams();
  const navigate = useNavigate();
  const link = useReleaseLink();
  const { release, previous } = useRelease();
  const valid = species === 'human' || species === 'mouse';
  const sp = (valid ? species : 'human') as Species;
  const { data: catalog, error, loading } = useCatalog(release?.id || null, sp);

  if (!valid) return <Navigate to={link('/explore/human')} replace />;

  const meta = release?.species[sp];
  const single = catalog?.universal.filter((g) => g.exons === 1).length ?? 0;
  const releaseLabel = release ? `Release ${release.id}` : '';
  const previousLabel = previous ? previous.name : null;

  return (
    <Page>
      <PageHeader
        title={`${SPECIES_LABEL[sp]} gene sets`}
        meta={
          meta &&
          release && (
            <>
              Release {release.id}. Built on {meta.annotation.join(', ')}; expression from {meta.expression.join(', ')}.
            </>
          )
        }
        actions={<SpeciesSwitch value={sp} onChange={(s) => navigate(link(`/explore/${s}`))} />}
      />

      {loading && !catalog && <LinearProgress />}
      {error && <Alert severity="error">Could not load the {sp} catalog ({error}).</Alert>}

      {catalog && (
        <Box sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity .2s' }}>
          <Figures
            items={[
              { label: 'universal genes', value: catalog.universal.length },
              { label: 'single-exon / multi-exon', value: `${single} / ${catalog.universal.length - single}` },
              { label: 'tissue sets', value: catalog.tissues.length },
              {
                label: 'genes per tissue set',
                value: `${catalog.tissues[catalog.tissues.length - 1]?.n ?? 0}–${catalog.tissues[0]?.n ?? 0}`,
              },
            ]}
          />

          <Section
            id="universal"
            title="Universal set"
            subtitle="Genes with a single annotated isoform that are expressed across tissues. Use them to benchmark any sample."
            action={
              <Stack direction="row" spacing={1}>
                <FileButton href={fileUrl(catalog, `tusco_${sp}.tsv`)} label="TSV" primary size="small" />
                {catalog.files.includes(`tusco_${sp}.gtf`) && (
                  <FileButton href={fileUrl(catalog, `tusco_${sp}.gtf`)} label="GTF" size="small" />
                )}
              </Stack>
            }
          >
            <Panel padded={false}>
              <GeneTable catalog={catalog} showStatus={!!previous} />
            </Panel>
            {catalog.dropped.length > 0 && previous && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                {catalog.dropped.length} genes of the {inSentence(previous.name)} are no longer in the set, mostly because
                GENCODE now annotates more than one isoform for them.{' '}
                <Link component={RouterLink} to={link('/releases')}>
                  See which genes and why
                </Link>
                .
              </Typography>
            )}
          </Section>

          <Section
            id="tissues"
            title="Tissue sets"
            subtitle={
              sp === 'human'
                ? 'Genes expressed in one GTEx tissue that pass the same single-isoform filters. Larger than the universal set, for samples of a known tissue.'
                : 'Genes expressed in one Bgee tissue (kidney also from ENCODE) that pass the same single-isoform filters. Larger than the universal set, for samples of a known tissue.'
            }
            action={
              <FileButton
                href={`/api/download/bulk/${sp}?release=${catalog.release}`}
                label={`All ${catalog.tissues.length} sets (ZIP)`}
                size="small"
              />
            }
          >
            <TissueExplorer catalog={catalog} releaseLabel={releaseLabel} previousLabel={previousLabel} />
          </Section>
        </Box>
      )}
    </Page>
  );
};

export default Explore;
