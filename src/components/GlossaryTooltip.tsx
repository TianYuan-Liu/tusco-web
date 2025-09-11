import React from 'react';
import { Tooltip, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: 'var(--color-gray-900)',
    color: 'var(--color-text-inverse)',
    maxWidth: 300,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    padding: theme.spacing(2),
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
  },
}));

interface GlossaryTooltipProps {
  term: string;
  definition?: string;
  children: React.ReactNode;
}

const glossaryTerms: Record<string, string> = {
  'Sn': 'Sensitivity: The proportion of true positives correctly identified by the method. Measures how well the method detects actual transcripts.',
  'nrPre': 'Non-redundant Precision: Precision calculated after removing redundant predictions. Measures accuracy of unique transcript identifications.',
  'rPre': 'Redundant Precision: Precision including all predictions, even redundant ones. Shows overall prediction accuracy.',
  'PDR': 'Positive Detection Rate: Rate at which true positive cases are detected. Similar to sensitivity but calculated differently.',
  'FDR': 'False Discovery Rate: Proportion of false positives among all positive predictions. Lower FDR indicates better precision.',
  'TP': 'True Positives: Correctly identified transcripts that actually exist in the reference.',
  'PTP': 'Partial True Positives: Transcripts that are partially correct but may have structural differences.',
  'FP': 'False Positives: Incorrectly identified transcripts that do not exist in the reference.',
  'FN': 'False Negatives: Actual transcripts that were missed by the prediction method.',
  'SQANTI3': 'A quality control tool for long-read transcript annotations that classifies transcripts and evaluates their accuracy.',
  'TUSCO-novel': 'TUSCO novel isoform recovery test that masks known transcripts to assess method ability to recover unannotated isoforms.',
  'RIN': 'RNA Integrity Number: A measure of RNA degradation, where higher values indicate better RNA quality.',
  'SIRVs': 'Spike-In RNA Variant Control Standards: Synthetic RNA controls with known sequences used for benchmarking.',
  'LRS': 'Long-Read Sequencing: DNA sequencing technologies that produce reads significantly longer than traditional methods.',
  'GTF': 'Gene Transfer Format: A file format used to hold information about gene structure and annotations.',
  'GENCODE': 'A high-quality reference gene annotation database for human and mouse genomes.',
  'RefSeq': 'NCBI Reference Sequence Database: A comprehensive, non-redundant set of sequences including genomic DNA and proteins.',
  'MANE': 'Matched Annotation from NCBI and EMBL-EBI: A collaboration to provide matched annotations between RefSeq and Ensembl.',
  'TSS': 'Transcription Start Site: The location where transcription of a gene begins.',
  'refTSS': 'A database of human transcription start sites validated by Cap Analysis Gene Expression (CAGE).',
  'recount3': 'A resource of processed RNA-seq data from over 750,000 publicly available samples.',
  'IntroVerse': 'A computational tool for detecting intron retention in RNA-seq data.',
  'RPKM': 'Reads Per Kilobase of transcript per Million mapped reads: A normalized measure of gene expression.',
  'AlphaGenome': 'A genomic analysis platform for processing and analyzing large-scale genomic datasets.',
};

const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ term, definition, children }) => {
  const theme = useTheme();
  const tooltipDefinition = definition || glossaryTerms[term] || `Definition for ${term} not available.`;

  return (
    <StyledTooltip
      title={
        <div>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'inherit' }}>
            {term}
          </Typography>
          <Typography variant="body2" sx={{ color: 'inherit' }}>
            {tooltipDefinition}
          </Typography>
        </div>
      }
      arrow
      placement="top"
      enterDelay={300}
      leaveDelay={200}
    >
      <Typography
        component="span"
        sx={{
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '2px',
          textDecorationColor: 'var(--color-primary-main)',
          color: 'var(--color-primary-main)',
          cursor: 'help',
          fontWeight: 500,
          '&:hover': {
            textDecorationStyle: 'solid',
          },
        }}
      >
        {children}
      </Typography>
    </StyledTooltip>
  );
};

export default GlossaryTooltip;