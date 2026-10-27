import React, { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Chip,
  InputAdornment,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { Catalog, formatLocus, UniversalGene } from '../data/catalog';
import { tokens } from '../theme';
import { Mono, NewChip } from './ui';
import { useReleaseLink } from '../context/ReleaseContext';

type SortKey = 'symbol' | 'locus' | 'exons' | 'tissues';
type Filter = 'all' | 'single' | 'multi' | 'new';

const ENSEMBL_SPECIES = { human: 'Homo_sapiens', mouse: 'Mus_musculus' } as const;

const chromRank = (c: string) => {
  const v = c.replace(/^chr/, '');
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 100 + v.charCodeAt(0) : n;
};

const GeneTable: React.FC<{ catalog: Catalog; showStatus: boolean }> = ({ catalog, showStatus }) => {
  const theme = useTheme();
  const t = tokens[theme.palette.mode];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'tissues', dir: 'desc' });
  const nTissues = catalog.tissues.length;
  const link = useReleaseLink();

  const counts = useMemo(
    () => ({
      single: catalog.universal.filter((g) => g.exons === 1).length,
      multi: catalog.universal.filter((g) => (g.exons || 0) > 1).length,
      new: catalog.universal.filter((g) => g.status === 'new').length,
    }),
    [catalog]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const keep = (g: UniversalGene) =>
      (filter === 'all' ||
        (filter === 'single' && g.exons === 1) ||
        (filter === 'multi' && (g.exons || 0) > 1) ||
        (filter === 'new' && g.status === 'new')) &&
      (!q || [g.symbol, g.id, g.transcript, g.refseqMrna, g.entrez].some((v) => v.toLowerCase().includes(q)));
    const value = (g: UniversalGene): [number, number | string] => {
      switch (sort.key) {
        case 'symbol':
          return [0, g.symbol.toLowerCase()];
        case 'locus':
          return [chromRank(g.chrom), g.start || 0];
        case 'exons':
          return [g.exons || 0, g.symbol.toLowerCase()];
        default:
          return [g.tissues, g.symbol.toLowerCase()];
      }
    };
    const sign = sort.dir === 'asc' ? 1 : -1;
    return catalog.universal.filter(keep).sort((a, b) => {
      const [a1, a2] = value(a);
      const [b1, b2] = value(b);
      if (a1 !== b1) return (a1 < b1 ? -1 : 1) * sign;
      return a2 < b2 ? -1 : a2 > b2 ? 1 : 0;
    });
  }, [catalog, query, filter, sort]);

  const header = (key: SortKey, label: string, align: 'left' | 'right' = 'left') => (
    <TableCell align={align} sortDirection={sort.key === key ? sort.dir : false}>
      <TableSortLabel
        active={sort.key === key}
        direction={sort.key === key ? sort.dir : 'asc'}
        onClick={() =>
          setSort((s) => {
            if (s.key === key) return { key, dir: s.dir === 'asc' ? 'desc' : 'asc' };
            // Text and position sort ascending first, counts descending
            return { key, dir: key === 'symbol' || key === 'locus' ? 'asc' : 'desc' };
          })
        }
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  const filters: { key: Filter; label: string; n: number }[] = [
    { key: 'all', label: 'All', n: catalog.universal.length },
    { key: 'single', label: 'Single-exon', n: counts.single },
    { key: 'multi', label: 'Multi-exon', n: counts.multi },
    ...(showStatus && counts.new ? [{ key: 'new' as Filter, label: 'New in this release', n: counts.new }] : []),
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ p: 2, pb: 1.5 }}>
        <TextField
          size="small"
          placeholder="Search gene or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: { sm: 320 } }}
          inputProps={{ 'aria-label': 'Search genes' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={`${f.label} · ${f.n}`}
              size="small"
              variant={filter === f.key ? 'filled' : 'outlined'}
              color={filter === f.key ? 'primary' : 'default'}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </Stack>
      </Stack>
      <TableContainer sx={{ maxHeight: 560 }}>
        <Table size="small" stickyHeader aria-label="Universal TUSCO genes">
          <TableHead>
            <TableRow>
              {header('symbol', 'Gene')}
              <TableCell>Transcript</TableCell>
              {header('locus', 'Location')}
              {header('exons', 'Exons', 'right')}
              <TableCell>RefSeq</TableCell>
              {header('tissues', 'In tissue sets')}
              {showStatus && <TableCell>Status</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((g) => (
              <TableRow key={g.id} hover>
                <TableCell>
                  <Link
                    href={`https://www.ensembl.org/${ENSEMBL_SPECIES[catalog.species]}/Gene/Summary?g=${g.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontWeight: 650 }}
                  >
                    {g.symbol || g.id}
                  </Link>
                  <Box>
                    <Mono>{g.id}</Mono>
                  </Box>
                </TableCell>
                <TableCell>
                  <Mono>{g.transcript}</Mono>
                </TableCell>
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={link(`/browser/${catalog.species}?gene=${g.id}`)}
                    title="Show in the genome browser"
                  >
                    <Mono>{formatLocus(g)}</Mono>
                  </Link>
                  {g.strand && (
                    <Typography component="span" variant="caption" sx={{ ml: 0.75 }}>
                      ({g.strand})
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">{g.exons ?? '–'}</TableCell>
                <TableCell>
                  {g.entrez ? (
                    <Link href={`https://www.ncbi.nlm.nih.gov/gene/${g.entrez}`} target="_blank" rel="noopener noreferrer">
                      <Mono>{g.refseqMrna || g.entrez}</Mono>
                    </Link>
                  ) : (
                    <Mono>{g.refseqMrna}</Mono>
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: t.grid, overflow: 'hidden', maxWidth: 90 }}
                      aria-hidden
                    >
                      <Box sx={{ width: `${(100 * g.tissues) / Math.max(1, nTissues)}%`, height: '100%', backgroundColor: t.series, borderRadius: 3 }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 48 }}>
                      {g.tissues}/{nTissues}
                    </Typography>
                  </Stack>
                </TableCell>
                {showStatus && <TableCell>{g.status === 'new' ? <NewChip /> : null}</TableCell>}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  No gene matches “{query}”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GeneTable;
