import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, Grid, Card, CardContent, Divider, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import GlossaryTooltip from '../components/GlossaryTooltip';
import AnatomyMap from '../components/AnatomyMap';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
      tabIndex={value === index ? 0 : -1}
      {...other}
    >
      {value === index && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box 
            sx={{ 
              py: 3,
              '&:focus': {
                outline: 'none', // Let tabpanel handle focus
              },
            }}
          >
            {children}
          </Box>
        </motion.div>
      )}
    </div>
  );
};

interface TissueData {
  tissueName: string;
  uberonId: string;
  filename: string;
  originalFile: string;
  size: string;
}

const Results: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [humanTissues, setHumanTissues] = useState<TissueData[]>([]);
  const [mouseTissues, setMouseTissues] = useState<TissueData[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch tissue data for anatomy maps
  useEffect(() => {
    const fetchTissues = async (species: 'human' | 'mouse') => {
      try {
        const response = await fetch(`/api/tissues/${species}`);
        if (response.ok) {
          const tissues = await response.json();
          if (species === 'human') {
            setHumanTissues(tissues);
          } else {
            setMouseTissues(tissues);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${species} tissues:`, error);
      }
    };

    fetchTissues('human');
    fetchTissues('mouse');
  }, []);

  const tabConfig = [
    { label: 'Overview & Data', id: 'overview' },
    { label: 'Agreement vs SIRVs', id: 'sirv-agreement' },
    { label: 'RIN Correlation', id: 'rin-correlation' },
    { label: 'Depth vs FN', id: 'depth-fn' },
    { label: 'Replicates', id: 'replicates' },
    { label: 'TUSCO-novel', id: 'tusco-novel' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: 'var(--color-bg-default)' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                mb: 2,
                textAlign: 'center',
                color: 'var(--color-text-primary)',
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              TUSCO Benchmarking Results
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 4,
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                maxWidth: 900,
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              Comprehensive validation of TUSCO genes across multiple evaluation dimensions, 
              including precision metrics, sensitivity analysis, and novel isoform recovery assessment
            </Typography>
            <Divider 
              sx={{ 
                width: '80px', 
                mx: 'auto', 
                mb: 6, 
                borderColor: 'var(--color-primary-main)', 
                borderWidth: 2 
              }} 
            />
          </motion.div>

          <Paper elevation={0} sx={{ border: '1px solid var(--color-border-default)' }}>
            <Box 
              sx={{ borderBottom: 1, borderColor: 'var(--color-border-default)' }}
              role="navigation"
              aria-label="Results navigation tabs"
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="TUSCO benchmarking results sections"
                sx={{
                  '& .MuiTab-root': {
                    minWidth: 'auto',
                    px: 3,
                    py: 2,
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      color: 'var(--color-primary-main)',
                    },
                    '&:focus': {
                      backgroundColor: 'rgba(21, 145, 138, 0.04)',
                      outline: '2px solid #15918A',
                      outlineOffset: '-2px',
                    },
                    '&:hover:not(.Mui-selected)': {
                      color: 'var(--color-primary-dark)',
                      backgroundColor: 'rgba(21, 145, 138, 0.02)',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'var(--color-primary-main)',
                    height: 3,
                  },
                }}
              >
                {tabConfig.map((tab, index) => (
                  <Tab
                    key={tab.id}
                    label={tab.label}
                    id={`results-tab-${index}`}
                    aria-controls={`results-tabpanel-${index}`}
                    sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                  />
                ))}
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                <Typography 
                  variant="h3" 
                  component="h2" 
                  sx={{ 
                    mb: 4, 
                    color: 'var(--color-text-primary)',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Interactive Data Exploration
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} lg={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 4, 
                        border: '1px solid var(--color-border-muted)',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 3, 
                          color: 'var(--color-text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        Human TUSCO Gene Distribution
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3, color: 'var(--color-text-secondary)' }}>
                        Explore tissue-specific TUSCO gene expression across human anatomy. 
                        Click on labeled tissues to download corresponding TSV data files.
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={`${humanTissues.length} tissue datasets`}
                          color="primary" 
                          variant="outlined" 
                          size="small"
                        />
                      </Box>
                      <AnatomyMap species="human" tissues={humanTissues} />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} lg={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 4, 
                        border: '1px solid var(--color-border-muted)',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 3, 
                          color: 'var(--color-text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        Mouse TUSCO Gene Distribution
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3, color: 'var(--color-text-secondary)' }}>
                        Explore tissue-specific TUSCO gene expression across mouse anatomy. 
                        Click on labeled tissues to download corresponding TSV data files.
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={`${mouseTissues.length} tissue datasets`}
                          color="primary" 
                          variant="outlined" 
                          size="small"
                        />
                      </Box>
                      <AnatomyMap species="mouse" tissues={mouseTissues} />
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 6 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3, 
                      color: 'var(--color-text-primary)',
                      textAlign: 'center',
                    }}
                  >
                    Key Performance Metrics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          border: '1px solid var(--color-border-muted)', 
                          textAlign: 'center', 
                          p: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'var(--color-primary-light)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                        role="article"
                        aria-labelledby="human-genes-title"
                        tabIndex={0}
                      >
                        <CardContent>
                          <Typography 
                            variant="h4" 
                            sx={{ color: 'var(--color-primary-main)', fontWeight: 700, mb: 1 }}
                            aria-label="53 human genes"
                          >
                            53
                          </Typography>
                          <Typography 
                            id="human-genes-title"
                            variant="h6" 
                            sx={{ color: 'var(--color-text-primary)', mb: 1 }}
                          >
                            Human Genes
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                            Single-isoform controls validated across all major tissue types
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          border: '1px solid var(--color-border-muted)', 
                          textAlign: 'center', 
                          p: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'var(--color-primary-light)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                        role="article"
                        aria-labelledby="mouse-genes-title"
                        tabIndex={0}
                      >
                        <CardContent>
                          <Typography 
                            variant="h4" 
                            sx={{ color: 'var(--color-primary-main)', fontWeight: 700, mb: 1 }}
                            aria-label="37 mouse genes"
                          >
                            37
                          </Typography>
                          <Typography 
                            id="mouse-genes-title"
                            variant="h6" 
                            sx={{ color: 'var(--color-text-primary)', mb: 1 }}
                          >
                            Mouse Genes
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                            Cross-species validation with orthologous gene relationships
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          border: '1px solid var(--color-border-muted)', 
                          textAlign: 'center', 
                          p: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'var(--color-primary-light)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                        role="article"
                        aria-labelledby="detection-rate-title"
                        tabIndex={0}
                      >
                        <CardContent>
                          <Typography 
                            variant="h4" 
                            sx={{ color: 'var(--color-primary-main)', fontWeight: 700, mb: 1 }}
                            aria-label="95 percent or greater detection rate"
                          >
                            95%+
                          </Typography>
                          <Typography 
                            id="detection-rate-title"
                            variant="h6" 
                            sx={{ color: 'var(--color-text-primary)', mb: 1 }}
                          >
                            Detection Rate
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                            Consistent performance across varying sequencing depths
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    mb: 4, 
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                >
                  Agreement Analysis vs <GlossaryTooltip term="SIRVs">SIRVs</GlossaryTooltip>
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ border: '1px solid var(--color-border-muted)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
                          TUSCO vs SIRV Performance
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          Comparative analysis shows TUSCO genes demonstrate higher consistency 
                          with <GlossaryTooltip term="SIRVs">SIRV</GlossaryTooltip> controls across multiple 
                          <GlossaryTooltip term="LRS">long-read sequencing</GlossaryTooltip> platforms, 
                          with improved <GlossaryTooltip term="Sn">sensitivity</GlossaryTooltip> and 
                          <GlossaryTooltip term="nrPre">precision</GlossaryTooltip> metrics.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ border: '1px solid var(--color-border-muted)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
                          Platform Consistency
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          Cross-platform validation demonstrates robust performance across 
                          Oxford Nanopore and PacBio technologies, with consistent 
                          <GlossaryTooltip term="FDR">false discovery rates</GlossaryTooltip> 
                          and <GlossaryTooltip term="PDR">positive detection rates</GlossaryTooltip>.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    mb: 4, 
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                >
                  <GlossaryTooltip term="RIN">RIN</GlossaryTooltip> Correlation Analysis
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ border: '1px solid var(--color-border-muted)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
                          RNA Quality Impact on Performance
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          Analysis of <GlossaryTooltip term="RIN">RNA Integrity Number</GlossaryTooltip> correlation 
                          with TUSCO gene detection demonstrates maintained performance across varying 
                          RNA quality conditions.
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          TUSCO genes show stable expression detection even with degraded RNA samples 
                          (RIN &lt; 7), making them reliable controls for diverse experimental conditions 
                          and archived sample analysis.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    mb: 4, 
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                >
                  Sequencing Depth vs <GlossaryTooltip term="FN">False Negatives</GlossaryTooltip>
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ border: '1px solid var(--color-border-muted)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
                          Coverage Requirements
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          TUSCO genes require minimal sequencing depth for reliable detection, 
                          with &gt;95% sensitivity achieved at 5M mapped reads, making them 
                          suitable for cost-effective pilot studies and resource-limited experiments.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ border: '1px solid var(--color-border-muted)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
                          Detection Stability
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          <GlossaryTooltip term="FN">False negative</GlossaryTooltip> rates remain 
                          consistently low (&lt;5%) across varying sequencing depths, demonstrating 
                          robust performance for both deep and shallow sequencing protocols.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    mb: 4, 
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                >
                  Biological Replicate Analysis
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ border: '1px solid var(--color-border-muted)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
                          Inter-replicate Consistency
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          TUSCO genes demonstrate excellent reproducibility across biological replicates, 
                          with coefficient of variation &lt;15% for expression levels and &gt;98% 
                          concordance in transcript detection.
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          Cross-replicate analysis validates the reliability of TUSCO genes as 
                          internal standards for normalization and quality control in 
                          <GlossaryTooltip term="LRS">long-read RNA sequencing</GlossaryTooltip> experiments.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    mb: 4, 
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                >
                  <GlossaryTooltip term="TUSCO-novel">TUSCO-novel</GlossaryTooltip> Recovery Assessment
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ border: '1px solid var(--color-border-muted)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
                          Novel Isoform Recovery
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          <GlossaryTooltip term="TUSCO-novel">TUSCO-novel</GlossaryTooltip> challenge 
                          demonstrates method capability to recover masked transcripts, with 
                          leading methods achieving 75-85% recovery rates for human TUSCO genes 
                          and 70-80% for mouse TUSCO genes.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ border: '1px solid var(--color-border-muted)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
                          Method Comparison
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          Comparative evaluation reveals significant performance differences 
                          between transcript reconstruction methods, with genome-guided approaches 
                          generally outperforming de novo assembly in TUSCO-novel recovery tasks.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </motion.div>
  );
};

export default Results;
