// Load SVG paths from a JSON file containing anatomical data
async function loadAnatomicalPaths() {
  try {
    const response = await fetch('/assets/anatomical-paths.json');
    const paths = await response.json();
    
    // Get the SVG element
    const svg = document.getElementById('body-map-svg');
    
    // Create path elements for each anatomical region
    Object.entries(paths).forEach(([organ, pathData]) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('id', organ);
      path.setAttribute('class', 'tissue-region');
      path.setAttribute('d', pathData.path);
      path.setAttribute('fill', pathData.color || '#cccccc');
      path.setAttribute('data-uberon', pathData.uberonId);
      path.setAttribute('data-name', pathData.name);
      
      svg.appendChild(path);
    });
  } catch (error) {
    console.error('Failed to load anatomical paths:', error);
  }
}

// Call this function when your page loads
document.addEventListener('DOMContentLoaded', loadAnatomicalPaths);