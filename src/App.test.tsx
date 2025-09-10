import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders TUSCO Database header', () => {
  render(<App />);
  const headerElement = screen.getByText(/TUSCO Database/i);
  expect(headerElement).toBeInTheDocument();
});
