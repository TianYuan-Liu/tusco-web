import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import useDarkMode from '../hooks/useDarkMode';
import { motion } from 'framer-motion';

const DarkModeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <IconButton
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          sx={{
            color: 'var(--color-text-secondary)',
            '&:hover': {
              backgroundColor: 'var(--color-border-muted)',
              color: 'var(--color-primary-main)',
            },
            '&:focus-visible': {
              outline: '2px solid var(--color-primary-main)',
              outlineOffset: '2px',
            },
          }}
        >
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </motion.div>
    </Tooltip>
  );
};

export default DarkModeToggle;