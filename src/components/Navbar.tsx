import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, useScrollTrigger } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: '#ffffff',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease-in-out',
        boxShadow: trigger ? '0 1px 3px 0 rgba(15, 23, 42, 0.08)' : 'none',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1.5 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1 
            }}
          >
            <Box
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                component="img"
                src="/2025-4_Logos_AnaConesa_V3_tusco.svg"
                alt="TUSCO Logo"
                sx={{ 
                  height: 40,
                  width: 'auto',
                }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  letterSpacing: '-0.01em',
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                TUSCO Database
              </Typography>
            </Box>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              gap: { xs: 1, md: 2 } 
            }}
          >
            {[
              { path: '/', label: 'Home' },
              { path: '/human', label: 'Human Data' },
              { path: '/mouse', label: 'Mouse Data' },
              { path: '/pipeline', label: 'Pipeline' },
            ].map(({ path, label }) => (
              <motion.div
                key={path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  component={RouterLink}
                  to={path}
                  variant="text"
                  size="medium"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', md: '0.9rem' },
                    px: { xs: 1.5, md: 2 },
                    py: { xs: 0.75, md: 1 },
                    borderRadius: 2,
                    color: '#475569',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.04)',
                      color: '#15918A',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      color: '#15918A',
                      backgroundColor: 'rgba(21, 145, 138, 0.04)',
                    }
                  }}
                >
                  {label}
                </Button>
              </motion.div>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;