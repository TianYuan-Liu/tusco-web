import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Grid,
  InputAdornment,
  LinearProgress,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchRounded from '@mui/icons-material/SearchRounded';
import BarChartRounded from '@mui/icons-material/BarChartRounded';
import TableRowsRounded from '@mui/icons-material/TableRowsRounded';
import AccessibilityNewRounded from '@mui/icons-material/AccessibilityNewRounded';
import { Link as RouterLink } from 'react-router-dom';
import { Catalog, fileUrl, inSentence, useTissueGenes } from '../data/catalog';
import { useReleaseLink } from '../context/ReleaseContext';
import AnatomyMap from './AnatomyMap';
import TissueChart from './TissueChart';
import { FileButton, Mono, Panel } from './ui';

type View = 'chart' | 'table' | 'map';

interface Props {
  catalog: Catalog;
  releaseLabel: string;
  previousLabel: string | null;
}

const TissueExplorer: React.FC<Props> = ({ catalog, releaseLabel, previousLabel }) => {
  const theme = useTheme();
  const [view, setView] = useState<View>('chart');
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const tissues = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? catalog.tissues.filter((t) => t.name.toLowerCase().includes(q)) : catalog.tissues;
  }, [catalog, query]);
  const selected = catalog.tissues.find((t) => t.slug === selectedSlug) || null;
  const genes = useTissueGenes(catalog, selected);
  const universalIds = useMemo(() => new Set(catalog.universal.map((g) => g.id)), [catalog]);
  const select = useCallback((slug: string) => setSelectedSlug(slug), []);
  const link = useReleaseLink();
  // On narrow screens the gene list sits below the chart: bring it into view
  const stacked = useMediaQuery(theme.breakpoints.down('md'));
  const detailRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (stacked && selectedSlug) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [stacked, selectedSlug]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Panel padded={false}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }} alignItems={{ sm: 'center' }}>
            <TextField
              size="small"
              placeholder={`Filter ${catalog.tissues.length} tissues`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={view === 'map'}
              inputProps={{ 'aria-label': 'Filter tissues' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)} aria-label="Tissue view">
              <ToggleButton value="chart" aria-label="Chart">
                <BarChartRounded fontSize="small" sx={{ mr: 0.5 }} /> Chart
              </ToggleButton>
              <ToggleButton value="table" aria-label="Table">
                <TableRowsRounded fontSize="small" sx={{ mr: 0.5 }} /> Table
              </ToggleButton>
              <ToggleButton value="map" aria-label="Body map">
                <AccessibilityNewRounded fontSize="small" sx={{ mr: 0.5 }} /> Body map
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Box sx={{ px: 2, pb: 2, maxHeight: 760, overflowY: 'auto' }}>
            {view === 'chart' && (
              <TissueChart
                tissues={tissues}
                selected={selectedSlug}
                onSelect={select}
                releaseLabel={releaseLabel}
                previousLabel={previousLabel}
              />
            )}
            {view === 'table' && (
              <TableContainer>
                <Table size="small" aria-label="Genes per tissue set">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tissue</TableCell>
                      <TableCell align="right">Genes</TableCell>
                      {previousLabel && <TableCell align="right">{previousLabel}</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tissues.map((t) => (
                      <TableRow
                        key={t.slug}
                        hover
                        selected={t.slug === selected?.slug}
                        onClick={() => select(t.slug)}
                        sx={{ cursor: 'pointer' }}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && select(t.slug)}
                      >
                        <TableCell>{t.name}</TableCell>
                        <TableCell align="right">{t.n}</TableCell>
                        {previousLabel && <TableCell align="right">{t.previous ?? '–'}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {view === 'map' && (
              <>
                <Typography variant="caption" component="p" sx={{ mb: 1 }}>
                  Click a labelled tissue to list its genes. Grey labels have no tissue set.
                </Typography>
                <AnatomyMap
                  species={catalog.species}
                  tissues={catalog.tissues}
                  base={catalog.base}
                  selected={selected?.slug || null}
                  onSelect={select}
                />
              </>
            )}
          </Box>
        </Panel>
        {catalog.removedTissues.length > 0 && (
          <Typography variant="caption" component="p" sx={{ mt: 1.5 }}>
            No genes pass in {catalog.removedTissues.join(', ')} in this release, so these tissues have no set.
          </Typography>
        )}
      </Grid>

      <Grid size={{ xs: 12, md: 5 }} ref={detailRef} sx={{ scrollMarginTop: 72 }}>
        <Panel sx={{ position: { md: 'sticky' }, top: { md: 90 } }}>
          {!selected && (
            <Typography variant="body2" color="text.secondary">
              Select a tissue in the chart, the table or the body map to list its genes and download its set.
            </Typography>
          )}
          {selected && (
            <Box>
              <Typography variant="h3" component="h3" sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
                {selected.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {selected.n} genes
                {previousLabel && selected.previous !== null && ` (${selected.previous} in the ${inSentence(previousLabel)})`}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, mb: 2 }} flexWrap="wrap" useFlexGap>
                <FileButton href={fileUrl(catalog, selected.tsv)} label="TSV" primary />
                {selected.gtf && <FileButton href={fileUrl(catalog, selected.gtf)} label="GTF" />}
              </Stack>
              {genes.loading && <LinearProgress sx={{ mb: 1 }} />}
              {genes.error && <Alert severity="error">Could not load the gene list ({genes.error}).</Alert>}
              {genes.data && (
                <TableContainer sx={{ maxHeight: 460, opacity: genes.loading ? 0.5 : 1 }}>
                  <Table size="small" stickyHeader aria-label={`Genes of ${selected.name}`}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Gene</TableCell>
                        <TableCell>Ensembl ID</TableCell>
                        <TableCell>RefSeq</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {genes.data.map((g) => (
                        <TableRow key={g.id}>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <Link
                              component={RouterLink}
                              to={link(`/browser/${catalog.species}?gene=${g.id.split('.')[0]}`)}
                              title="Show in the genome browser"
                            >
                              {g.symbol}
                            </Link>
                            {universalIds.has(g.id.split('.')[0]) && (
                              <Box
                                component="span"
                                title="Also in the universal set"
                                sx={{ ml: 0.75, fontSize: '0.72rem', fontWeight: 500, color: 'primary.main' }}
                              >
                                universal
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <Mono>{g.id}</Mono>
                          </TableCell>
                          <TableCell>
                            {g.entrez ? (
                              <Link href={`https://www.ncbi.nlm.nih.gov/gene/${g.entrez}`} target="_blank" rel="noopener noreferrer">
                                <Mono>{g.refseqMrna || g.entrez}</Mono>
                              </Link>
                            ) : (
                              <Mono>{g.refseqMrna}</Mono>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Panel>
      </Grid>
    </Grid>
  );
};

export default TissueExplorer;
