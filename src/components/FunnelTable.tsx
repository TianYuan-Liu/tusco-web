import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FunnelStep } from '../data/catalog';
import { tokens } from '../theme';

// Genes left after each selection step: a table whose rows carry an inline bar.
// Bars use a square-root scale so the last steps (tens of genes) stay visible next
// to the first (thousands); the numbers are the exact values.
const FunnelTable: React.FC<{ steps: FunnelStep[]; previous?: FunnelStep[] | null; previousLabel?: string }> = ({
  steps,
  previous,
  previousLabel,
}) => {
  const theme = useTheme();
  const t = tokens[theme.palette.mode];
  const max = Math.max(...steps.map((s) => s.n), ...(previous || []).map((s) => s.n));
  const width = (n: number) => `${(100 * Math.sqrt(n)) / Math.sqrt(max)}%`;

  return (
    <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }} aria-label="Genes remaining after each step">
      {steps.map((s, i) => {
        const prev = previous?.find((p) => p.step === s.step) || previous?.[i];
        return (
          <Box
            component="li"
            key={s.step}
            sx={{ py: 1.25, borderTop: i ? `1px solid ${theme.palette.divider}` : 'none' }}
          >
            <Stack direction="row" spacing={1.5} alignItems="baseline">
              <Typography
                variant="caption"
                sx={{ width: 18, flexShrink: 0, fontWeight: 700, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
              >
                {i + 1}
              </Typography>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {s.step}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 52, textAlign: 'right' }}>
                {s.n.toLocaleString('en-US')}
              </Typography>
            </Stack>
            <Box sx={{ ml: '30px', mr: '64px', mt: 0.75, position: 'relative', height: 8 }}>
              <Box sx={{ position: 'absolute', inset: 0, borderRadius: 4, backgroundColor: t.grid }} />
              <Box
                sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: width(s.n), borderRadius: '0 4px 4px 0', backgroundColor: t.series }}
              />
              {prev && (
                <Box
                  title={`${previousLabel}: ${prev.n.toLocaleString('en-US')}`}
                  sx={{ position: 'absolute', top: -3, bottom: -3, width: 2, borderRadius: 1, left: width(prev.n), backgroundColor: t.inkSecondary }}
                />
              )}
            </Box>
            {prev && (
              <Typography variant="caption" component="div" sx={{ ml: '30px', mt: 0.5 }}>
                {previousLabel}: {prev.n.toLocaleString('en-US')}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default FunnelTable;
