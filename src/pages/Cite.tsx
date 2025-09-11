import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Button, Snackbar, Alert, Divider, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';

const Cite: React.FC = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setSnackbarOpen(true);
  };

  const citationText = `Liu, T., Paniagua, A., Jetzinger, F., Ferrández-Peral, L., Frankish, A., and Conesa, A. (2025). Transcriptome Universal Single-isoform COntrol: A Framework for Evaluating Transcriptome reconstruction Quality. bioRxiv. https://doi.org/10.1101/2025.08.23.671926`;

  const bibtexText = `@article{liu2025tusco,
  title={Transcriptome Universal Single-isoform COntrol: A Framework for Evaluating Transcriptome reconstruction Quality},
  author={Liu, Tianyuan and Paniagua, Alejandro and Jetzinger, Fabian and Ferrández-Peral, Luis and Frankish, Adam and Conesa, Ana},
  journal={bioRxiv},
  year={2025},
  doi={10.1101/2025.08.23.671926},
  url={https://doi.org/10.1101/2025.08.23.671926}
}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
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
        <Container maxWidth="md">
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
              Citation
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 6,
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6,
              }}
            >
              Please cite TUSCO in your publications when using our datasets or methodology
            </Typography>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-paper)',
                }}
              >
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    mb: 3,
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  Primary Citation
                </Typography>
                
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: 'var(--color-gray-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-muted)',
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'var(--font-family-mono)',
                      lineHeight: 1.6,
                      color: 'var(--color-text-primary)',
                      fontSize: '0.95rem',
                    }}
                  >
                    {citationText}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopyToClipboard(citationText, 'citation')}
                  sx={{
                    borderColor: 'var(--color-primary-main)',
                    color: 'var(--color-primary-main)',
                    '&:hover': {
                      borderColor: 'var(--color-primary-dark)',
                      backgroundColor: 'var(--color-primary-50)',
                    },
                  }}
                >
                  Copy Citation
                </Button>
              </Paper>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-paper)',
                }}
              >
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    mb: 3,
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  BibTeX Format
                </Typography>

                <Box
                  sx={{
                    p: 3,
                    backgroundColor: 'var(--color-gray-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-muted)',
                    mb: 3,
                  }}
                >
                  <Typography
                    component="pre"
                    sx={{
                      fontFamily: 'var(--font-family-mono)',
                      lineHeight: 1.6,
                      color: 'var(--color-text-primary)',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                    }}
                  >
                    {bibtexText}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopyToClipboard(bibtexText, 'BibTeX')}
                  sx={{
                    borderColor: 'var(--color-primary-main)',
                    color: 'var(--color-primary-main)',
                    '&:hover': {
                      borderColor: 'var(--color-primary-dark)',
                      backgroundColor: 'var(--color-primary-50)',
                    },
                  }}
                >
                  Copy BibTeX
                </Button>
              </Paper>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-paper)',
                }}
              >
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    mb: 3,
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  Additional Resources
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, color: 'var(--color-text-primary)' }}>
                      <Chip
                        icon={<LinkIcon />}
                        label="DOI"
                        size="small"
                        sx={{
                          mr: 1,
                          backgroundColor: 'var(--color-primary-100)',
                          color: 'var(--color-primary-main)',
                        }}
                      />
                      Digital Object Identifier
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                      DOI: <a href="https://doi.org/10.1101/2025.08.23.671926" target="_blank" rel="noopener noreferrer">10.1101/2025.08.23.671926</a>
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, color: 'var(--color-text-primary)' }}>
                      Data Availability
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 2 }}>
                      All TUSCO datasets, code, and supplementary materials are publicly available:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label="GitHub Repository"
                        variant="outlined"
                        size="small"
                        sx={{ borderColor: 'var(--color-border-default)' }}
                      />
                      <Chip
                        label="Zenodo Archive"
                        variant="outlined"
                        size="small"
                        sx={{ borderColor: 'var(--color-border-default)' }}
                      />
                      <Chip
                        label="GEO Database"
                        variant="outlined"
                        size="small"
                        sx={{ borderColor: 'var(--color-border-default)' }}
                      />
                    </Box>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, color: 'var(--color-text-primary)' }}>
                      Contact Information
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                      For questions about TUSCO methodology, data, or collaborative opportunities, 
                      please contact the corresponding authors or submit an issue on our GitHub repository.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            backgroundColor: 'var(--color-success-main)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          {copiedText} copied to clipboard!
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default Cite;
