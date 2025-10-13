import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Divider, Chip, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import BiotechIcon from '@mui/icons-material/Biotech';
import DatasetIcon from '@mui/icons-material/Dataset';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';

const pipelineSources = [
  {
    name: 'GENCODE',
    description: 'v49 human and vM38 mouse reference annotations',
  },
  {
    name: 'RefSeq',
    description: 'GRCh38.p14 (human) and GRCm39 (mouse) transcript catalogs',
  },
  {
    name: 'MANE Select',
    description: 'MANE v1.4 harmonized reference transcripts',
  },
  {
    name: 'Ensembl BioMart mapping',
    description: 'Cross-references between Ensembl, RefSeq, and NCBI gene IDs',
  },
  {
    name: 'recount3 junctions',
    description: 'Population-scale splice junction evidence for alternative splicing screens',
  },
  {
    name: 'refTSS',
    description: 'refTSS v4.1 promoters used to validate transcription start sites',
  },
  {
    name: 'IntroVerse',
    description: 'IntroVerse_80 population isoform usage screen (human)',
  },
  {
    name: 'Bgee',
    description: 'Curated expression presence/absence calls with RNA-Seq metadata',
  },
  {
    name: 'HRT Atlas',
    description: 'Housekeeping gene catalog reinforcing universal expression',
  },
  {
    name: 'ENCODE expression panels',
    description: 'Tissue-specific expression thresholds for validation',
  },
  {
    name: 'AlphaGenome',
    description: 'AlphaGenome-based RPKM and splice-purity scoring',
  },
];

type StatItem = {
  label: string;
  value: string;
  tooltip: React.ReactNode;
};

const Home = () => {
  const navigate = useNavigate();

  const [tissueCounts, setTissueCounts] = useState<{ human: number | null; mouse: number | null }>({
    human: null,
    mouse: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const [humanResponse, mouseResponse] = await Promise.all([
          fetch('/api/tissues/human'),
          fetch('/api/tissues/mouse'),
        ]);

        if (!humanResponse.ok || !mouseResponse.ok) {
          throw new Error('Failed to load tissue metadata');
        }

        const [humanData, mouseData] = await Promise.all([
          humanResponse.json(),
          mouseResponse.json(),
        ]);

        if (!cancelled) {
          setTissueCounts({
            human: Array.isArray(humanData) ? humanData.length : null,
            mouse: Array.isArray(mouseData) ? mouseData.length : null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch tissue counts for Home page:', error);
        }
      }
    };

    fetchCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const features = [
    {
      icon: <DatasetIcon sx={{ fontSize: 42, color: '#15918A' }} />,
      eyebrow: 'Benchmark design',
      title: 'Dual-Faceted Benchmarking',
      description: 'Evaluates precision by surfacing transcripts that deviate from trusted annotations while validating sensitivity through tissue-wise completeness checks.',
      metrics: ['Precision QC layer', 'Sensitivity coverage'],
    },
    {
      icon: <BiotechIcon sx={{ fontSize: 42, color: '#15918A' }} />,
      eyebrow: 'Reference panels',
      title: 'Validated Gene Sets',
      description: 'Universal reference set of 46 human and 32 mouse TUSCO genes—single-isoform genes rigorously validated across multiple annotation databases and tissues.',
      metrics: ['Human: 46 genes', 'Mouse: 32 genes'],
    },
    {
      icon: <DownloadIcon sx={{ fontSize: 42, color: '#15918A' }} />,
      eyebrow: 'Evaluation challenge',
      title: 'Novel-Isoform Challenge',
      description: 'Masks TUSCO transcripts to test reconstruction pipelines on recovering true, now-unannotated isoforms with confidence.',
      metrics: ['Mask + recover loop', 'Isoform fidelity'],
    },
  ];

  const stats: StatItem[] = [
    {
      label: 'Human tissues profiled',
      value: tissueCounts.human !== null ? tissueCounts.human.toString() : '—',
      tooltip: 'Total human tissue datasets currently available in TUSCO',
    },
    {
      label: 'Mouse tissues profiled',
      value: tissueCounts.mouse !== null ? tissueCounts.mouse.toString() : '—',
      tooltip: 'Total mouse tissue datasets currently available in TUSCO',
    },
    {
      label: 'Pipeline data sources',
      value: pipelineSources.length.toString(),
      tooltip: (
        <Box component="ul" sx={{ pl: 2.5, m: 0, display: 'grid', gap: 0.75, color: '#ffffff' }}>
          {pipelineSources.map((source) => (
            <Box
              key={source.name}
              component="li"
              sx={{ color: '#ffffff', lineHeight: 1.5 }}
            >
              <Box component="span" sx={{ fontWeight: 600, color: '#ffffff' }}>{source.name}</Box>
              {`: ${source.description}`}
            </Box>
          ))}
        </Box>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Logo removed from here as it's now in the navbar */}
          
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <Box sx={{ textAlign: 'center', maxWidth: 1000, mx: 'auto', mb: { xs: 3, md: 4 } }}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontFamily: '"Poppins", "Inter", sans-serif',
                  fontWeight: 900,
                  mb: 2,
                  background: 'linear-gradient(135deg, #15918A 0%, #0F6B66 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '5.5rem' },
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                }}
              >
                TUSCO
              </Typography>
              <Typography
                variant="h2"
                component="p"
                sx={{
                  fontFamily: '"Poppins", "Inter", sans-serif',
                  fontWeight: 600,
                  color: '#475569',
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem', lg: '1.6rem' },
                  lineHeight: 1.4,
                  letterSpacing: '-0.01em',
                }}
              >
                Transcriptome Universal Single-isoform COntrol
              </Typography>
            </Box>
          </motion.div>
          
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                mb: 6,
                textAlign: 'center',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6,
                color: '#475569',
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                fontWeight: 400,
              }}
            >
              A reproducible pipeline integrating multi-source annotations, population splicing evidence, and broad expression compendia with strict "no evidence for alternative isoforms" criteria for transcriptome benchmarking
              <Box component="span" sx={{ color: '#0F6B66', fontWeight: 600 }}>—ensuring single-isoform confidence</Box>
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 2, sm: 3 },
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/downloads/human')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    backgroundColor: '#15918A',
                    color: 'white',
                    fontWeight: 600,
                    px: { xs: 3.5, sm: 4 },
                    py: 1.5,
                    fontSize: '1rem',
                    minHeight: '48px',
                    boxShadow: '0 10px 25px rgba(21, 145, 138, 0.2)',
                    '&:hover': {
                      backgroundColor: '#0F6B66',
                      boxShadow: '0 12px 28px rgba(15, 107, 102, 0.22)',
                    },
                  }}
                >
                  Explore Human Data
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/downloads/mouse')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    color: '#15918A',
                    borderColor: '#15918A',
                    fontWeight: 600,
                    px: { xs: 3.5, sm: 4 },
                    py: 1.5,
                    fontSize: '1rem',
                    minHeight: '48px',
                    '&:hover': {
                      backgroundColor: 'rgba(21, 145, 138, 0.04)',
                      borderColor: '#0F6B66',
                    },
                  }}
                >
                  Explore Mouse Data
                </Button>
              </motion.div>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          >
            <Grid
              container
              spacing={{ xs: 2, sm: 3 }}
              sx={{
                mt: { xs: 6, md: 8 },
                justifyContent: 'center',
              }}
            >
              {stats.map((stat) => (
                <Grid item xs={12} sm={4} key={stat.label}>
                  <Tooltip title={stat.tooltip} arrow placement="top" componentsProps={{ tooltip: { sx: { maxWidth: 320 } } }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        textAlign: 'center',
                        borderRadius: 3,
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        background: '#ffffffcc',
                        backdropFilter: 'blur(6px)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                        },
                      }}
                    >
                      <Typography
                        variant="h3"
                        component="p"
                        sx={{
                          fontWeight: 700,
                          color: '#0f172a',
                          mb: 1,
                          fontSize: { xs: '2rem', sm: '2.25rem' },
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.5 }}>
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </motion.div>
          
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: -120, 
              left: 0, 
              right: 0, 
              height: 200, 
              background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
              zIndex: -1,
              display: { xs: 'none', md: 'block' }
            }} 
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
            <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.12em' }}>
              Why TUSCO matters
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                mt: 1,
                fontWeight: 600,
                color: '#0f172a',
                fontSize: { xs: '1.8rem', md: '2.2rem' },
              }}
            >
              Designed for rigorous transcriptome benchmarking
            </Typography>
            <Typography
              variant="body1"
              sx={{ mt: 2, color: '#475569', maxWidth: 720, mx: 'auto', lineHeight: 1.7 }}
            >
              Each component of the TUSCO framework reinforces reliability—from how we design challenges to how we validate gene sets and evaluate reconstruction fidelity.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      height: '100%',
                      minHeight: { xs: 'auto', md: '380px' },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      borderRadius: 3,
                      textAlign: 'left',
                      transition: 'all 0.2s ease-in-out',
                      border: '1px solid rgba(15, 23, 42, 0.06)',
                      background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.6) 0%, #ffffff 45%)',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 18px 30px -12px rgba(15, 23, 42, 0.25)',
                        border: '1px solid rgba(21, 145, 138, 0.35)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(21, 145, 138, 0.08)',
                          color: '#15918A',
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Chip
                        label={feature.eyebrow}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#0F6B66',
                          backgroundColor: 'rgba(21, 145, 138, 0.12)',
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ mb: 1.5, fontWeight: 600, color: '#0f172a', lineHeight: 1.35 }}
                      >
                        {feature.title}
                      </Typography>
                      {feature.title === 'Validated Gene Sets' ? (
                        <Typography color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                          46{' '}
                          <Box
                            component="a"
                            href="/data/human/tusco_human.tsv"
                            download="tusco_human.tsv"
                            sx={{
                              color: '#15918A',
                              fontWeight: 600,
                              textDecoration: 'none',
                              cursor: 'pointer',
                              borderBottom: '2px solid transparent',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: '#0F6B66',
                                borderBottom: '2px solid #0F6B66',
                              },
                            }}
                          >
                            human
                          </Box>
                          {' '}and 32{' '}
                          <Box
                            component="a"
                            href="/data/mouse/tusco_mouse.tsv"
                            download="tusco_mouse.tsv"
                            sx={{
                              color: '#15918A',
                              fontWeight: 600,
                              textDecoration: 'none',
                              cursor: 'pointer',
                              borderBottom: '2px solid transparent',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: '#0F6B66',
                                borderBottom: '2px solid #0F6B66',
                              },
                            }}
                          >
                            mouse
                          </Box>
                          {' '}TUSCO genes, rigorously selected and validated across multiple annotation databases.
                        </Typography>
                      ) : (
                        <Typography color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                          {feature.description}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
                      {feature.metrics.map((metric) => (
                        <Chip
                          key={metric}
                          label={metric}
                          variant="outlined"
                          sx={{
                            borderColor: 'rgba(21, 145, 138, 0.4)',
                            color: '#0F6B66',
                            fontWeight: 500,
                            backgroundColor: 'rgba(21, 145, 138, 0.05)',
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        <Box sx={{ mt: { xs: 10, md: 16 }, mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mb: 2,
                textAlign: 'center',
                fontFamily: '"Poppins", "Inter", sans-serif',
                fontWeight: 800,
                fontSize: { xs: '2.2rem', md: '2.8rem', lg: '3rem' },
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #15918A 0%, #0F6B66 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              About TUSCO
            </Typography>
            <Divider 
              sx={{ 
                width: '60px', 
                mx: 'auto', 
                mb: 6, 
                borderColor: '#15918A', 
                borderWidth: 2 
              }} 
            />
          </motion.div>
          
          <Grid container spacing={6} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.9, color: '#334155' }}>
                    <Box component="span" sx={{ fontWeight: 700, color: '#0F6B66', fontSize: '1.15rem' }}>
                      TUSCO constructs reference gene sets
                    </Box>
                    {' '}through a rigorous multi-step pipeline that integrates GENCODE, RefSeq, and MANE annotations, screens for population-level alternative splicing using recount3 data, and validates TSS consistency with refTSS.
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      border: '1px solid rgba(21, 145, 138, 0.25)',
                      background: 'linear-gradient(135deg, rgba(21, 145, 138, 0.12) 0%, rgba(21, 145, 138, 0.04) 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(21, 145, 138, 0.15)',
                        border: '1px solid rgba(21, 145, 138, 0.4)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: 'rgba(21, 145, 138, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SecurityIcon sx={{ fontSize: 28, color: '#0F6B66' }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: '"Poppins", "Inter", sans-serif',
                          fontWeight: 700,
                          fontSize: '1.4rem',
                          color: '#0F6B66',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Pipeline safeguards
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ pl: 0, m: 0, display: 'grid', gap: 2, listStyle: 'none' }}>
                      <Box component="li" sx={{ display: 'flex', gap: 1.5, color: '#334155', lineHeight: 1.8, fontSize: '1rem' }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#15918A', mt: 0.3, flexShrink: 0 }} />
                        <span>AlphaGenome-based RPKM screening with species-aware thresholds.</span>
                      </Box>
                      <Box component="li" sx={{ display: 'flex', gap: 1.5, color: '#334155', lineHeight: 1.8, fontSize: '1rem' }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#15918A', mt: 0.3, flexShrink: 0 }} />
                        <span>Splice purity requirements to minimize hidden isoform signals.</span>
                      </Box>
                      <Box component="li" sx={{ display: 'flex', gap: 1.5, color: '#334155', lineHeight: 1.8, fontSize: '1rem' }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#15918A', mt: 0.3, flexShrink: 0 }} />
                        <span>Tissue validation with curated exclusion filtering.</span>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    border: '1px solid rgba(21, 145, 138, 0.25)',
                    background: 'linear-gradient(135deg, rgba(21, 145, 138, 0.12) 0%, rgba(21, 145, 138, 0.04) 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(21, 145, 138, 0.15)',
                      border: '1px solid rgba(21, 145, 138, 0.4)',
                    },
                    display: 'grid',
                    gap: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'rgba(21, 145, 138, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StorageIcon sx={{ fontSize: 28, color: '#0F6B66' }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Poppins", "Inter", sans-serif',
                        fontWeight: 700,
                        fontSize: '1.4rem',
                        color: '#0F6B66',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      What the deliverables include
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.9, color: '#334155' }}>
                    The curated sets provide <Box component="span" sx={{ fontWeight: 700, color: '#0F6B66', fontSize: '1.15rem' }}>46 human</Box> and <Box component="span" sx={{ fontWeight: 700, color: '#0F6B66', fontSize: '1.15rem' }}>32 mouse</Box> TUSCO genes that serve as internal reference standards. Each release captures filtering decisions, synchronized mapping subsets, and paired GTF files so benchmarking studies can be reproduced end-to-end.
                  </Typography>
                  <Box
                    component="a"
                    href="/pipeline"
                    sx={{
                      mt: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      color: '#15918A',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      textDecoration: 'none',
                      borderBottom: '2px solid transparent',
                      width: 'fit-content',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: '#0F6B66',
                        borderBottomColor: '#0F6B66',
                      },
                    }}
                  >
                    Review the data access pipeline <ArrowForwardIcon fontSize="small" />
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </motion.div>
  );
};

export default Home;
