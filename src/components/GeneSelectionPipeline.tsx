import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Modal,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// Define interfaces for our component props and state
interface GeneSelectionPipelineProps {
  species?: 'human' | 'mouse';
}

const GeneSelectionPipeline: React.FC<GeneSelectionPipelineProps> = ({ species = 'human' }) => {
  // Define standardized section styling for consistent appearance
  const sectionStyle = {
    p: 3,
    borderRadius: 2,
    border: '1px solid rgba(0,0,0,0.08)',
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for active step and modal
  const [activeStep, setActiveStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: React.ReactNode;
  }>({ title: '', content: null });

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // Handle modal open/close
  const handleOpenModal = (title: string, content: React.ReactNode) => {
    setModalContent({ title, content });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Sample data for charts
  const annotationConsistencyData = {
    labels: species === 'human' 
      ? ['Cross-annotation Matches', 'Population Screening', 'Expression Filtering', 'Final TUSCO Set'] 
      : ['Cross-annotation Matches', 'Population Screening', 'Expression Filtering', 'Final TUSCO Set'],
    datasets: [
      {
        label: 'Gene Count',
        data: species === 'human' ? [150, 120, 80, 53] : [100, 80, 60, 37],
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        borderWidth: 1,
      },
    ],
  };

  const expressionData = {
    labels: species === 'human' 
      ? ['Brain', 'Heart', 'Liver', 'Lung', 'Kidney', 'Muscle'] 
      : ['Brain', 'Heart', 'Liver', 'Lung', 'Kidney'],
    datasets: [
      {
        label: 'Expression Level',
        data: species === 'human' 
          ? [85, 92, 78, 88, 90, 82] 
          : [80, 88, 75, 85, 87],
        backgroundColor: theme.palette.primary.main,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: species === 'human' ? 'Human Gene Validation' : 'Mouse Gene Validation',
      },
    },
  };

  // Define steps content
  const steps = [
    {
      label: 'Multi-source Annotation Integration',
      description: species === 'human' 
        ? 'Retrieval and harmonization of gene annotations with Ensembl BioMart mapping'
        : 'Integration of gene annotations with corresponding Ensembl BioMart mapping',
      content: (
        <Box sx={{ mt: 2, width: '100%' }}>
          <Paper 
            elevation={0} 
            sx={sectionStyle}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Annotation Integration & Harmonization
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': { transform: 'translateY(-5px)' }
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {species === 'human' ? 'GENCODE' : 'GENCODE'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive gene annotation with high-quality manual curation and computational predictions.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': { transform: 'translateY(-5px)' }
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {species === 'human' ? 'RefSeq' : 'RefSeq'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      NCBI's curated reference sequences providing standardized gene annotations.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': { transform: 'translateY(-5px)' }
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {species === 'human' ? 'MANE' : 'Ensembl BioMart'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {species === 'human' 
                        ? 'Matched Annotation from NCBI and EMBL-EBI providing clinical-grade transcripts'
                        : 'Cross-reference mapping for consistent gene identification'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                startIcon={<InfoIcon />}
                onClick={() => handleOpenModal('Annotation Integration Details', 
                  <Typography variant="body1">
                    TUSCO integrates multiple high-quality annotation sources to ensure robust gene selection:
                    <br/><br/>
                    <strong>Step 1:</strong> Retrieve annotations from all sources
                    <br/>
                    <strong>Step 2:</strong> Normalize chromosome labels across databases
                    <br/>
                    <strong>Step 3:</strong> Identify genes that are single-isoform in each source
                    <br/>
                    <strong>Step 4:</strong> Require exact identity of exon-intron structure and strand across all GTFs
                    <br/>
                    <strong>Step 5:</strong> Retain only cross-annotation matches with synchronized mapping subsets
                    <br/><br/>
                    This multi-source approach ensures that selected genes have consistent annotations across the most authoritative databases in genomics.
                  </Typography>
                )}
                sx={{ mt: 2 }}
              >
                Learn More About Integration Process
              </Button>
            </Box>
          </Paper>
        </Box>
      ),
    },
    {
      label: 'Population-Level Alternative Splicing & TSS Screening',
      description: species === 'human' 
        ? 'Screening for alternative splicing using recount3 junction data and TSS validation'
        : 'Alternative splicing screening with recount3 and TSS validation using refTSS for single-exon genes',
      content: (
        <Box sx={{ mt: 2, width: '100%' }}>
          <Paper 
            elevation={0} 
            sx={sectionStyle}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Population-Level Evidence Screening
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Splice Junction Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip 
                      label="recount3 junction BEDs" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ fontWeight: 500 }} 
                    />
                    <Chip 
                      label="T = 0.10 × μ threshold" 
                      color="secondary" 
                      variant="outlined" 
                      sx={{ fontWeight: 500 }} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    For multi-exon genes, compute mean coverage of annotated junctions (μ) and declare novel junctions as supporting alternative isoforms if coverage exceeds threshold T = 0.10 × μ (minimum 1 read).
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    TSS Validation
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip 
                      label="refTSS v4.1" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ fontWeight: 500 }} 
                    />
                    <Chip 
                      label="±300bp CAGE window" 
                      color="secondary" 
                      variant="outlined" 
                      sx={{ fontWeight: 500 }} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {species === 'human' 
                      ? 'Single-exon genes require exon-overlap check and ±300bp CAGE window validation. Multi-exon genes use ±300bp window.'
                      : 'Single-exon genes undergo exon-overlap validation using refTSS intervals.'
                    }
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                startIcon={<InfoIcon />}
                onClick={() => handleOpenModal('Population Screening Details', 
                  <Box>
                    <Typography variant="body1" paragraph>
                      Population-level screening ensures genes lack evidence of alternative splicing or transcription start sites in real datasets.
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
                      Splice Junction Screening (Multi-exon genes):
                    </Typography>
                    <ul>
                      <li>
                        <Typography variant="body2" paragraph>
                          Derive splice evidence from recount3 junction BEDs
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2" paragraph>
                          Compute mean coverage (μ) of annotated junctions
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2" paragraph>
                          Flag novel junctions with coverage &gt; T = 0.10 × μ (min 1 read)
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2" paragraph>
                          Ignore novel junctions shorter than 80 bp
                        </Typography>
                      </li>
                    </ul>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
                      TSS Validation:
                    </Typography>
                    <ul>
                      <li>
                        <Typography variant="body2" paragraph>
                          {species === 'human' 
                            ? 'Single-exon: exon-overlap check + ±300bp CAGE window validation'
                            : 'Single-exon genes: exon-overlap rule using refTSS intervals'
                          }
                        </Typography>
                      </li>
                      {species === 'human' && (
                        <li>
                          <Typography variant="body2" paragraph>
                            Multi-exon: ±300bp CAGE window validation
                          </Typography>
                        </li>
                      )}
                    </ul>
                  </Box>
                )}
                sx={{ mt: 2 }}
              >
                Learn More About Population Screening
              </Button>
            </Box>
          </Paper>
        </Box>
      ),
    },
    {
      label: 'Expression-Based Universality Assessment',
      description: species === 'human'
        ? 'Establishing universality using Bgee present/absent calls with 90% prevalence threshold and HRT Atlas housekeeping genes'
        : 'Universal gene identification using Bgee calls with 90% prevalence threshold across tissues',
      content: (
        <Box sx={{ mt: 2, width: '100%' }}>
          <Paper 
            elevation={0} 
            sx={sectionStyle}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Expression-Based Universality Assessment
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Bgee Expression Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        label="Gold/Silver/Bronze Quality" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 500 }} 
                      />
                      <Chip 
                        label="90% Prevalence" 
                        color="secondary" 
                        variant="outlined" 
                        sx={{ fontWeight: 500 }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Genes called universal if present in ≥90% of tissues with ≥25,000 distinct expressed genes. {species === 'human' ? 'Accepts gold, silver, or bronze quality calls.' : 'Accepts gold and silver quality calls.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {species === 'human' ? 'HRT Atlas Integration' : 'Tissue-Specific Analysis'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {species === 'human' 
                        ? 'Housekeeping genes from HRT Atlas merged into universal set. ENCODE-derived calls use median RPKM ≥1.0 and prevalence ≥95% at RPKM &gt;0.1 for tissue-specific sets.'
                        : 'Per-tissue gene sets emitted using anatomical entity IDs mapped to tissue names. ENCODE filtering applied where specified using RPKM thresholds.'
                      }
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Universal expression validated
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                startIcon={<InfoIcon />}
                onClick={() => handleOpenModal('Expression Universality Details', 
                  <Box>
                    <Typography variant="body1" paragraph>
                      Expression-based universality ensures TUSCO genes are broadly expressed across diverse tissues and can serve as reliable internal standards.
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                      Bgee Analysis Process:
                    </Typography>
                    <ul>
                      <li>
                        <Typography variant="body2" paragraph>
                          Use Bgee present/absent calls and RNA-Seq metadata
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2" paragraph>
                          Retain {species === 'human' ? 'gold, silver, or bronze' : 'gold and silver'} quality calls
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2" paragraph>
                          Restrict analysis to tissues with ≥25,000 distinct expressed genes
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2" paragraph>
                          Call genes universal if present in ≥90% of retained tissues
                        </Typography>
                      </li>
                    </ul>
                    {species === 'human' && (
                      <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                          HRT Atlas Integration:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Housekeeping genes from HRT Atlas are merged into the universal set to reinforce universality when available.
                        </Typography>
                      </>
                    )}
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                      Tissue-Specific Sets:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Where specified, tissue-specific sets are intersected with ENCODE-derived calls using median RPKM ≥1.0 and prevalence ≥95% at RPKM &gt;0.1.
                    </Typography>
                  </Box>
                )}
                sx={{ mt: 2 }}
              >
                Learn More About Expression Analysis
              </Button>
            </Box>
          </Paper>
        </Box>
      ),
    },
    {
      label: 'AlphaGenome RPKM Consistency Screen',
      description: species === 'human'
        ? 'Population-level consistency screening with species-specific RPKM thresholds: ≥4.0 (single-exon) or ≥0.25 (multi-exon) median RPKM'
        : 'RPKM-based filtering with mouse-specific thresholds: ≥0.5 (single-exon) or ≥0.25 (multi-exon) median RPKM',
      content: (
        <Box sx={{ mt: 2, width: '100%' }}>
          <Paper 
            elevation={0} 
            sx={sectionStyle}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Population-Level RPKM Consistency Screening
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Species-Specific RPKM Thresholds
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {species === 'human' ? 'Human Criteria:' : 'Mouse Criteria:'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Chip 
                        label={`Median RPKM ≥${species === 'human' ? '4.0' : '0.5'} (single-exon)`}
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 500 }} 
                      />
                      <Chip 
                        label="Median RPKM ≥0.25 (multi-exon)"
                        color="secondary" 
                        variant="outlined" 
                        sx={{ fontWeight: 500 }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Chip 
                        label={`≥${species === 'human' ? '95%' : '90%'} prevalence (single-exon)`}
                        sx={{ 
                          fontWeight: 500, 
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main
                        }} 
                        variant="outlined" 
                      />
                      <Chip 
                        label="≥90% prevalence (multi-exon)"
                        sx={{ 
                          fontWeight: 500, 
                          borderColor: theme.palette.warning.main,
                          color: theme.palette.warning.main
                        }} 
                        variant="outlined" 
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    AlphaGenome-based screening ensures population-level consistency beyond presence/absence with species-specific thresholds.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Splice Purity Requirements
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip 
                      label="≥90% splice purity"
                      color="primary" 
                      variant="outlined" 
                      sx={{ fontWeight: 500 }} 
                    />
                    <Chip 
                      label="Splice ratio &lt;0.01"
                      color="secondary" 
                      variant="outlined" 
                      sx={{ fontWeight: 500 }} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Genes must maintain ≥90% of tissues with unannotated-to-annotated splice ratio &lt;0.01, ensuring high annotation fidelity.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      Final curated exclusion list applied
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                startIcon={<BarChartIcon />}
                onClick={() => handleOpenModal('RPKM Screening Details', 
                  <Box>
                    <Typography variant="body1" paragraph>
                      The final AlphaGenome-based RPKM screen ensures population-level consistency with species- and class-specific thresholds.
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
                      {species === 'human' ? 'Human' : 'Mouse'} Screening Criteria:
                    </Typography>
                    <ul>
                      <li>
                        <Typography variant="body2" paragraph>
                          Median RPKM ≥{species === 'human' ? '4.0' : '0.5'} (single-exon) or ≥0.25 (multi-exon)
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2" paragraph>
                          Prevalence ≥{species === 'human' ? '95%' : '90%'} (single-exon) or ≥90% (multi-exon) at RPKM &gt;{species === 'human' ? '0.5 (single-exon) or &gt;0.05 (multi-exon)' : '0.01 (single-exon) or &gt;0.005 (multi-exon)'}
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2" paragraph>
                          ≥90% of tissues with splice purity ≥0.90 (splice ratio &lt;0.01)
                        </Typography>
                      </li>
                    </ul>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
                      Tissue-Specific Filtering:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      For tissue-specific sets, additional screening requires tissue RPKM &gt;{species === 'human' ? '3.0' : '1.5'} and splice ratio &lt;0.001 in the tissue of interest.
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
                      Final Output:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      The pipeline writes synchronized mapping subsets alongside each GTF subset and records the first filter responsible for removal of every excluded gene.
                    </Typography>
                  </Box>
                )}
                sx={{ mt: 2 }}
              >
                View Detailed RPKM Criteria
              </Button>
            </Box>
          </Paper>
        </Box>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              mb: 2, 
              fontWeight: 700,
              color: theme.palette.primary.main
            }}
          >
            Selection and Validation of TUSCO Genes
          </Typography>
          <Divider sx={{ width: '80px', mx: 'auto', mb: 3, borderColor: theme.palette.primary.main, borderWidth: 2 }} />
          <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto' }}>
            Our rigorous multi-step process ensures that TUSCO genes provide a reliable standard for evaluating transcript identification in long-read RNA sequencing.
          </Typography>
        </Box>

        <Stepper 
          activeStep={activeStep} 
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{ 
            mb: 4,
            '.MuiStepConnector-line': {
              borderColor: theme.palette.primary.light,
              borderWidth: isMobile ? 1 : 2,
            },
            '.MuiStepLabel-iconContainer': {
              '& .MuiStepIcon-root': {
                color: theme.palette.primary.main,
                '&.Mui-active': {
                  color: theme.palette.primary.dark,
                },
                '&.Mui-completed': {
                  color: theme.palette.success.main,
                },
              },
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                }
              >
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: activeStep === index ? 700 : 600,
                    color: activeStep === index ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {step.label}
                </Typography>
              </StepLabel>
              {isMobile && <StepContent>{step.content}</StepContent>}
            </Step>
          ))}
        </Stepper>

        {/* Display content in a standardized grid layout when not in mobile view */}
        {!isMobile && (
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(1, 1fr)',
              gap: 4,
              mb: 4
            }}
          >
            {steps[activeStep].content}
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
            variant="outlined"
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleReset} variant="contained" color="primary">
              Reset
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained" color="primary">
              Next
            </Button>
          )}
        </Box>

        {/* Modal for detailed information */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '70%' },
            maxWidth: 800,
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: { xs: 3, md: 4 },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography id="modal-title" variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                {modalContent.title}
              </Typography>
              <IconButton onClick={handleCloseModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box id="modal-description" sx={{ mt: 2 }}>
              {modalContent.content}
            </Box>
          </Box>
        </Modal>
      </Container>
    </motion.div>
  );
};

export default GeneSelectionPipeline;
