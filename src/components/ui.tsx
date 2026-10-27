// Small shared building blocks of the TUSCO pages
import React from 'react';
import { Box, Button, Container, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import { Species, SPECIES, SPECIES_LABEL } from '../data/catalog';

export const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
    {children}
  </Container>
);

export const PageHeader: React.FC<{
  title: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, meta, children, actions }) => (
  <Stack
    direction={{ xs: 'column', md: 'row' }}
    spacing={2}
    alignItems={{ md: 'flex-end' }}
    justifyContent="space-between"
    sx={{ mb: { xs: 3, md: 4 } }}
  >
    <Box sx={{ maxWidth: 760 }}>
      <Typography variant="h1">{title}</Typography>
      {meta && (
        <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 1 }}>
          {meta}
        </Typography>
      )}
      {children && (
        <Typography variant="body1" color="text.secondary" component="div" sx={{ mt: 2 }}>
          {children}
        </Typography>
      )}
    </Box>
    {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
  </Stack>
);

export const Section: React.FC<{
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}> = ({ title, subtitle, action, children, id }) => (
  <Box
    component="section"
    id={id}
    sx={{ mt: { xs: 5, md: 6 }, pt: { xs: 3, md: 4 }, borderTop: 1, borderColor: 'divider', scrollMarginTop: 80 }}
  >
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ sm: 'flex-end' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{ mb: 2.5 }}
    >
      <Box>
        <Typography variant="h2">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 760 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
    {children}
  </Box>
);

export const Panel: React.FC<{ children: React.ReactNode; sx?: object; padded?: boolean }> = ({
  children,
  sx,
  padded = true,
}) => (
  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: padded ? { xs: 2, md: 2.5 } : 0, overflow: 'hidden', ...sx }}>
    {children}
  </Box>
);

// A row of figures separated by rules: value above, label below
export const Figures: React.FC<{ items: { label: string; value: React.ReactNode }[] }> = ({ items }) => (
  <Box
    component="dl"
    sx={{
      m: 0,
      display: 'grid',
      gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${items.length}, auto)` },
      justifyContent: 'start',
      borderTop: 1,
      borderBottom: 1,
      borderColor: 'divider',
    }}
  >
    {items.map((x, i) => (
      <Box
        key={x.label}
        sx={{
          py: 1.5,
          pr: { md: 5 },
          pl: { md: i ? 3 : 0 },
          borderLeft: { md: i ? 1 : 0 },
          borderColor: { md: 'divider' },
        }}
      >
        <Box component="dd" sx={{ m: 0, fontSize: '1.6rem', fontWeight: 600, lineHeight: 1.2 }}>
          {x.value}
        </Box>
        <Box component="dt" sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
          {x.label}
        </Box>
      </Box>
    ))}
  </Box>
);

export const SpeciesSwitch: React.FC<{ value: Species; onChange: (s: Species) => void }> = ({ value, onChange }) => (
  <ToggleButtonGroup exclusive size="small" value={value} onChange={(_, v) => v && onChange(v)} aria-label="Species">
    {SPECIES.map((s) => (
      <ToggleButton key={s} value={s} sx={{ px: 2 }}>
        {SPECIES_LABEL[s]}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

export const FileButton: React.FC<{
  href: string;
  label: string;
  primary?: boolean;
  download?: string | boolean;
  size?: 'small' | 'medium' | 'large';
}> = ({ href, label, primary, download = true, size = 'small' }) => (
  <Button
    href={href}
    download={download === true ? '' : download || undefined}
    variant={primary ? 'contained' : 'outlined'}
    color="primary"
    size={size}
    startIcon={<DownloadRounded sx={{ fontSize: '1rem !important' }} />}
    sx={primary ? undefined : { color: 'text.primary' }}
  >
    {label}
  </Button>
);

export const NewChip: React.FC = () => (
  <Box
    component="span"
    sx={{
      px: 0.6,
      py: 0.1,
      border: 1,
      borderColor: 'secondary.main',
      color: 'secondary.main',
      borderRadius: 0.75,
      fontSize: '0.72rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}
  >
    new
  </Box>
);

export const Mono: React.FC<{ children: React.ReactNode; wrap?: boolean }> = ({ children, wrap }) => (
  <Box component="code" sx={{ fontSize: '0.82rem', color: 'text.secondary', overflowWrap: wrap ? 'anywhere' : 'normal' }}>
    {children}
  </Box>
);
