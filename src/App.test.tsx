import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { parseGeneTable } from './data/catalog';

beforeEach(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) =>
      ({ matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} } as any));
  // The app reads data/releases.json and the catalogs; no release is needed for the shell
  global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any;
});

test('renders the site header and the home page title', () => {
  render(<App />);
  expect(screen.getByLabelText(/TUSCO home/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('TUSCO');
  expect(screen.getByText(/Transcriptome Universal Single-isoform COntrol/)).toBeInTheDocument();
});

test('parses TUSCO gene tables, skipping comments and the header', () => {
  const genes = parseGeneTable(
    '# Tissue: liver\n# Gene Count: 1\nGene_ID\tTranscript_ID\tGene_Symbol\tEntrezGene_ID\tRefSeq_mRNA_ID\tRefSeq_Protein_ID\n' +
      'ENSG1\tENST1\tA\t1\tNM_1\tNP_1\r\n'
  );
  expect(genes).toEqual([
    { id: 'ENSG1', transcript: 'ENST1', symbol: 'A', entrez: '1', refseqMrna: 'NM_1', refseqProtein: 'NP_1' },
  ]);
});
