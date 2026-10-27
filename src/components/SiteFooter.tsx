import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { useRelease, useReleaseLink } from '../context/ReleaseContext';
import { inSentence } from '../data/catalog';

const SiteFooter: React.FC = () => {
  const { release } = useRelease();
  const link = useReleaseLink();
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', mt: 4 }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography sx={{ fontWeight: 700 }}>TUSCO</Typography>
            <Typography variant="caption" component="p">
              Conesa Lab · Institute for Integrative Systems Biology (I2SysBio, CSIC–UV), Valencia
            </Typography>
            {release && (
              <Typography variant="caption" component="p">
                Showing release {release.id} ({inSentence(release.name)})
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap" useFlexGap>
            {[
              ['Gene sets', '/explore/human'],
              ['Genome browser', '/browser/human'],
              ['Downloads', '/downloads'],
              ['Method', '/method'],
              ['Releases', '/releases'],
              ['Cite', '/cite'],
            ].map(([label, to]) => (
              <Link key={to} component={RouterLink} to={link(to)} variant="body2" color="text.secondary">
                {label}
              </Link>
            ))}
            <Link href="https://github.com/ConesaLab/tusco-paper" variant="body2" color="text.secondary" target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default SiteFooter;
