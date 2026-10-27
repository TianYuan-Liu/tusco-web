import React, { useState } from 'react';
import { Box, Button, Grid, Link, Stack, Typography } from '@mui/material';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { Page, PageHeader, Panel, Section } from '../components/ui';
import { monoStack } from '../theme';

const DOI = '10.1038/s41467-026-72089-1';

const CITATION =
  'Liu, T., Paniagua, A., Jetzinger, F., Ferrández-Peral, L., Frankish, A. & Conesa, A. TUSCO: benchmarking transcriptome reconstruction with endogenous single-isoform controls. Nat. Commun. 17, 5654 (2026). https://doi.org/10.1038/s41467-026-72089-1';

const BIBTEX = `@article{liu2026tusco,
  title={{TUSCO}: benchmarking transcriptome reconstruction with endogenous single-isoform controls},
  author={Liu, Tianyuan and Paniagua, Alejandro and Jetzinger, Fabian and Ferrández-Peral, Luis and Frankish, Adam and Conesa, Ana},
  journal={Nature Communications},
  volume={17},
  pages={5654},
  year={2026},
  doi={${DOI}},
  url={https://doi.org/${DOI}}
}`;

const CopyBlock: React.FC<{ title: string; text: string; mono?: boolean }> = ({ title, text, mono }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <Panel>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h4" component="h2">
          {title}
        </Typography>
        <Button size="small" onClick={copy} startIcon={copied ? <CheckRounded /> : <ContentCopyRounded fontSize="small" />}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Stack>
      <Box
        component={mono ? 'pre' : 'p'}
        sx={{
          m: 0,
          p: 2,
          borderRadius: 2,
          bgcolor: 'action.hover',
          fontFamily: mono ? monoStack : 'inherit',
          fontSize: mono ? '0.8rem' : '0.95rem',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </Box>
    </Panel>
  );
};

const Cite: React.FC = () => (
  <Page>
    <PageHeader title="Citing TUSCO">
      If TUSCO helps your work, please cite the Nature Communications article below, and name the gene set release you
      used (for example “TUSCO release 2026.10”), since the sets change with the annotations.
    </PageHeader>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <CopyBlock title="Reference" text={CITATION} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CopyBlock title="BibTeX" text={BIBTEX} mono />
      </Grid>
    </Grid>
    <Section title="Links">
      <Stack spacing={1}>
        <Typography variant="body1">
          Article:{' '}
          <Link href={`https://doi.org/${DOI}`} target="_blank" rel="noopener noreferrer">
            doi.org/{DOI}
          </Link>{' '}
          (Nature Communications, 24 April 2026)
        </Typography>
        <Typography variant="body1">
          TUSCO in SQANTI3:{' '}
          <Link href="https://conesalab.github.io/SQANTI3/latest/Tusco-quick-start" target="_blank" rel="noopener noreferrer">
            quick start
          </Link>
        </Typography>
        <Typography variant="body1">
          Gene selection pipeline and the paper figures:{' '}
          <Link href="https://github.com/ConesaLab/tusco-paper" target="_blank" rel="noopener noreferrer">
            github.com/ConesaLab/tusco-paper
          </Link>
        </Typography>
      </Stack>
    </Section>
  </Page>
);

export default Cite;
