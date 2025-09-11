import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import BiotechIcon from '@mui/icons-material/Biotech';
import DatasetIcon from '@mui/icons-material/Dataset';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DatasetIcon sx={{ fontSize: 40, color: '#15918A' }} />,
      title: 'Dual-Faceted Benchmarking',
      description: 'Evaluates precision by identifying transcripts deviating from annotations and assesses sensitivity by verifying detection completeness',
    },
    {
      icon: <BiotechIcon sx={{ fontSize: 40, color: '#15918A' }} />,
      title: 'Validated Gene Sets',
      description: '53 human and 37 mouse TUSCO genes, rigorously selected and validated across multiple annotation databases',
    },
    {
      icon: <DownloadIcon sx={{ fontSize: 40, color: '#15918A' }} />,
      title: 'Novel-Isoform Challenge',
      description: 'Novel-isoform challenge framework that masks TUSCO transcripts to assess recovery of true, now-unannotated isoforms',
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
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 3,
                textAlign: 'center',
                color: '#0f172a',
                fontSize: { xs: '2.25rem', md: '3rem', lg: '3.5rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
              }}
            >
              TUSCO: Transcriptome Universal Single-isoform COntrol
            </Typography>
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
                gap: 3,
                justifyContent: 'center',
                flexWrap: 'wrap'
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
                    fontWeight: 500,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    minHeight: '48px',
                    '&:hover': {
                      backgroundColor: '#0F6B66',
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
                    fontWeight: 500,
                    px: 4,
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
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      transition: 'all 0.2s ease-in-out',
                      border: '1px solid rgba(15, 23, 42, 0.06)',
                      background: '#ffffff',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.12)',
                        border: '1px solid rgba(15, 23, 42, 0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        mb: 3,
                        background: 'rgba(21, 145, 138, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600, color: '#0f172a' }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
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
              variant="h3" 
              component="h2" 
              sx={{ 
                mb: 2, 
                textAlign: 'center',
                fontWeight: 600,
                color: '#0f172a',
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
          
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
                  <strong>TUSCO constructs reference gene sets</strong> through a rigorous multi-step pipeline that integrates GENCODE, RefSeq, and MANE annotations, screens for population-level alternative splicing using recount3 data, and validates TSS consistency with refTSS. The pipeline enforces strict criteria to ensure genes truly lack alternative isoforms.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
                  The methodology applies AlphaGenome-based RPKM screening with species-specific thresholds and splice purity requirements, ensuring population-level consistency beyond simple presence/absence calls. Final gene sets undergo tissue-specific validation and curated exclusion filtering.
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                
                <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto' }}>
                  The final curated sets provide <strong>53 human</strong> and <strong>37 mouse</strong> TUSCO genes that serve as internal reference standards. The pipeline records detailed filtering decisions and produces synchronized mapping subsets alongside GTF files, enabling reproducible benchmarking of transcriptome reconstruction methods.
                </Typography>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </motion.div>
  );
};

export default Home;
