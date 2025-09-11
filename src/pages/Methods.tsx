import React from 'react';
import { Container, Typography, Box, Paper, Grid, Divider, List, ListItem, ListItemText, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import GlossaryTooltip from '../components/GlossaryTooltip';

const Methods: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 10 }
    }
  };

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
                mb: 3,
                textAlign: 'center',
                color: 'var(--color-text-primary)',
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
              }}
            >
              Methods
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 6,
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                maxWidth: 800,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6,
              }}
            >
              Comprehensive pipeline for curated single-isoform endogenous control selection and validation
            </Typography>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      border: '1px solid var(--color-border-default)',
                      backgroundColor: 'var(--color-bg-paper)',
                    }}
                  >
                    <Typography variant="h4" component="h2" sx={{ mb: 3, color: 'var(--color-text-primary)' }}>
                      Pipeline Overview
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      <strong>TUSCO</strong> constructs reference gene sets through a multi-step pipeline integrating 
                      <GlossaryTooltip term="GENCODE"> GENCODE</GlossaryTooltip>, 
                      <GlossaryTooltip term="RefSeq"> RefSeq</GlossaryTooltip>, and 
                      <GlossaryTooltip term="MANE"> MANE</GlossaryTooltip> annotations, with population-level 
                      alternative splicing screening using <GlossaryTooltip term="recount3">recount3</GlossaryTooltip> data 
                      and <GlossaryTooltip term="TSS">TSS</GlossaryTooltip> consistency validation with 
                      <GlossaryTooltip term="refTSS">refTSS</GlossaryTooltip>.
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      The pipeline enforces strict "no evidence for alternative isoforms" criteria, applying 
                      <GlossaryTooltip term="AlphaGenome">AlphaGenome</GlossaryTooltip>-based 
                      <GlossaryTooltip term="RPKM">RPKM</GlossaryTooltip> screening with species-specific thresholds 
                      and splice purity requirements.
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      border: '1px solid var(--color-border-default)',
                      backgroundColor: 'var(--color-bg-paper)',
                    }}
                  >
                    <Typography variant="h4" component="h2" sx={{ mb: 3, color: 'var(--color-text-primary)' }}>
                      Benchmarking Framework
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      Dual-faceted evaluation using <GlossaryTooltip term="SQANTI3">SQANTI3</GlossaryTooltip> classification:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                              <strong>Precision Assessment:</strong> Identifies transcripts deviating from annotations via 
                              <GlossaryTooltip term="TP"> TP</GlossaryTooltip>/<GlossaryTooltip term="PTP">PTP</GlossaryTooltip>/<GlossaryTooltip term="FP">FP</GlossaryTooltip>/<GlossaryTooltip term="FN">FN</GlossaryTooltip> classification
                            </Typography>
                          }
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                              <strong>Sensitivity Evaluation:</strong> Verifies detection completeness using 
                              <GlossaryTooltip term="Sn">Sn</GlossaryTooltip>, <GlossaryTooltip term="nrPre">nrPre</GlossaryTooltip>, 
                              <GlossaryTooltip term="rPre">rPre</GlossaryTooltip>, <GlossaryTooltip term="PDR">PDR</GlossaryTooltip>, 
                              <GlossaryTooltip term="FDR">FDR</GlossaryTooltip> metrics
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </motion.div>
              </Grid>

              

              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 4,
                      border: '1px solid var(--color-border-default)',
                      backgroundColor: 'var(--color-bg-paper)',
                    }}
                  >
                    <Typography variant="h4" component="h2" sx={{ mb: 3, color: 'var(--color-text-primary)' }}>
                      <GlossaryTooltip term="TUSCO-novel">TUSCO-novel</GlossaryTooltip> Challenge Framework
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      Novel-isoform challenge framework that systematically masks TUSCO transcripts to assess 
                      <GlossaryTooltip term="LRS">long-read sequencing</GlossaryTooltip> method ability to recover 
                      true, now-unannotated isoforms from the masked reference.
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      This approach provides a ground-truth evaluation of novel isoform recovery capabilities, 
                      essential for benchmarking transcriptome reconstruction methods in discovery scenarios.
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
};

export default Methods;
