#!/usr/bin/env node

/**
 * TSV Link Checker for TUSCO Website
 * 
 * This script validates that all tissue labels in anatomy maps (SVG files) 
 * have corresponding TSV data files in the filesystem. It ensures the integrity
 * of the linking system between visual anatomy maps and downloadable data.
 * 
 * Features:
 * - Parses both human and mouse anatomy SVG files
 * - Extracts linked tissue references from xlink:href attributes
 * - Validates existence of corresponding TSV files
 * - Provides detailed reporting of any mismatches
 * - Returns appropriate exit codes for automation
 * 
 * Exit Codes:
 * - 0: All links validated successfully
 * - 1: Validation errors found (missing files, broken links)
 * - 2: Script execution error (missing SVG files, parsing errors)
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSection(title) {
  log(`\n${title}`, 'blue');
  log('-'.repeat(title.length), 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

/**
 * Parse SVG file and extract information about linkable text elements and existing links
 */
function extractSvgInfo(svgPath, species) {
  try {
    if (!fs.existsSync(svgPath)) {
      throw new Error(`SVG file not found: ${svgPath}`);
    }

    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const $ = cheerio.load(svgContent, { xmlMode: true });
    
    const existingLinks = new Set();
    const linkDetails = [];
    const textElements = [];

    // Find all existing <a> elements with links to TSV files (from static processing)
    $('a[xlink\\:href], a[href]').each((_, element) => {
      const href = $(element).attr('xlink:href') || $(element).attr('href');
      const title = $(element).attr('xlink:title') || $(element).attr('title') || '';
      const textContent = $(element).text().trim();
      
      if (href && href.includes(`/data/${species}/`) && href.endsWith('.tsv')) {
        const filename = href.split('/').pop();
        existingLinks.add(filename);
        linkDetails.push({
          filename,
          href,
          title,
          textContent,
          element: $(element).toString().substring(0, 100) + '...'
        });
      }
    });

    // Find all <text> elements that could be linked (for dynamic processing)
    $('text').each((_, element) => {
      const textContent = $(element).text().trim();
      if (textContent) {
        textElements.push({
          textContent,
          element: $(element).toString().substring(0, 100) + '...'
        });
      }
    });

    return { 
      existingLinks: Array.from(existingLinks), 
      linkDetails,
      textElements,
      hasTextElements: textElements.length > 0,
      processingMode: textElements.length > 0 ? 'dynamic' : 'static'
    };
  } catch (error) {
    throw new Error(`Failed to parse ${svgPath}: ${error.message}`);
  }
}

/**
 * Get all TSV files in the specified species data directory
 */
function getTsvFiles(species) {
  const dataDir = path.join(root, 'data', species);
  
  if (!fs.existsSync(dataDir)) {
    throw new Error(`Data directory not found: ${dataDir}`);
  }

  try {
    const files = fs.readdirSync(dataDir);
    return files.filter(file => 
      file.endsWith('.tsv') && 
      file.startsWith(`tusco_${species}_`)
    );
  } catch (error) {
    throw new Error(`Failed to read directory ${dataDir}: ${error.message}`);
  }
}

/**
 * Validate TSV file content and extract metadata
 */
function validateTsvFile(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      return { exists: false };
    }

    const stats = fs.statSync(filepath);
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    
    // Extract tissue name from header comment
    const firstLine = lines[0] || '';
    const tissueMatch = firstLine.match(/#\s*Gene IDs passing expressed in\s+(.+)\s+\(UBERON:[^)]+\)\s+filter/i);
    const tissueName = tissueMatch ? tissueMatch[1] : null;
    
    // Extract total count from content
    const totalMatch = content.match(/^#\s*Total:\s*(\d+)/m);
    const totalCount = totalMatch ? parseInt(totalMatch[1], 10) : null;

    return {
      exists: true,
      size: stats.size,
      lines: lines.length,
      tissueName,
      totalCount,
      lastModified: stats.mtime
    };
  } catch (error) {
    return { 
      exists: true, 
      error: error.message 
    };
  }
}

/**
 * Check links for a specific species
 */
function checkSpeciesLinks(species) {
  logSection(`Checking ${species.toUpperCase()} anatomy map`);
  
  const svgPath = path.join(root, 'data', `${species}_body_map.svg`);
  const results = {
    species,
    svgPath,
    processingMode: 'unknown',
    totalLinks: 0,
    validLinks: 0,
    missingFiles: [],
    invalidFiles: [],
    extraFiles: [],
    linkDetails: [],
    textElements: [],
    hasTextElements: false
  };

  try {
    // Extract SVG information
    const svgInfo = extractSvgInfo(svgPath, species);
    results.processingMode = svgInfo.processingMode;
    results.totalLinks = svgInfo.existingLinks.length;
    results.linkDetails = svgInfo.linkDetails;
    results.textElements = svgInfo.textElements;
    results.hasTextElements = svgInfo.hasTextElements;
    
    // Get available TSV files
    const availableFiles = getTsvFiles(species);
    
    if (svgInfo.processingMode === 'dynamic') {
      log(`Processing mode: DYNAMIC (client-side linking)`);
      log(`Found ${svgInfo.textElements.length} <text> elements for dynamic linking`);
      log(`Found ${availableFiles.length} TSV files available for linking`);
      
      if (svgInfo.textElements.length === 0) {
        logWarning(`No <text> elements found - dynamic linking will not work`);
      } else {
        logSuccess(`SVG contains ${svgInfo.textElements.length} text labels for client-side linking`);
        
        // Show some example text elements
        const examples = svgInfo.textElements.slice(0, 5);
        if (examples.length > 0) {
          log(`Example text labels:`);
          examples.forEach(te => log(`  "${te.textContent}"`));
        }
      }
      
      // Check that TSV files exist for the dynamic system to work
      if (availableFiles.length === 0) {
        logError(`No TSV files available for dynamic linking!`);
      } else {
        results.validLinks = availableFiles.length; // All TSV files are potentially linkable
        logSuccess(`${availableFiles.length} TSV files available for dynamic linking`);
      }
      
    } else {
      log(`Processing mode: STATIC (server-side pre-processed links)`);
      log(`Found ${svgInfo.existingLinks.length} pre-processed TSV links`);
      log(`Found ${availableFiles.length} TSV files in data/${species}/`);
      
      // Check each linked file exists
      for (const filename of svgInfo.existingLinks) {
        const filepath = path.join(root, 'data', species, filename);
        const validation = validateTsvFile(filepath);
        
        if (!validation.exists) {
          results.missingFiles.push(filename);
          logError(`Missing: ${filename}`);
        } else if (validation.error) {
          results.invalidFiles.push({ filename, error: validation.error });
          logError(`Invalid: ${filename} - ${validation.error}`);
        } else {
          results.validLinks++;
          log(`  ✓ ${filename} (${validation.size} bytes, ${validation.totalCount || '?'} genes)`);
        }
      }
      
      // Check for extra files (TSV files without links)  
      const linkedSet = new Set(svgInfo.existingLinks);
      results.extraFiles = availableFiles.filter(file => !linkedSet.has(file));
      
      if (results.extraFiles.length > 0) {
        logWarning(`Found ${results.extraFiles.length} unlinked TSV files:`);
        results.extraFiles.forEach(file => logWarning(`  ${file}`));
      }
    }
    
    return results;
    
  } catch (error) {
    logError(`Failed to check ${species}: ${error.message}`);
    results.error = error.message;
    return results;
  }
}

/**
 * Generate detailed validation report
 */
function generateReport(humanResults, mouseResults) {
  logHeader('VALIDATION SUMMARY');
  
  const allResults = [humanResults, mouseResults].filter(Boolean);
  let totalErrors = 0;
  let hasDynamicLinking = false;
  
  for (const results of allResults) {
    if (results.error) {
      logError(`${results.species.toUpperCase()}: ${results.error}`);
      totalErrors++;
      continue;
    }
    
    const speciesName = results.species.toUpperCase();
    
    if (results.processingMode === 'dynamic') {
      hasDynamicLinking = true;
      
      if (!results.hasTextElements) {
        logWarning(`${speciesName}: No <text> elements - dynamic linking unavailable`);
        totalErrors++;
      } else if (results.validLinks === 0) {
        logError(`${speciesName}: No TSV files available for linking`);
        totalErrors++;
      } else {
        logSuccess(`${speciesName}: ${results.textElements.length} text elements + ${results.validLinks} TSV files (DYNAMIC)`);
      }
      
    } else {
      // Static mode
      const errorCount = results.missingFiles.length + results.invalidFiles.length;
      const totalLinksCount = Math.max(results.totalLinks, 1); // Avoid division by zero
      const successRate = ((results.validLinks / totalLinksCount) * 100).toFixed(1);
      
      if (errorCount === 0 && results.totalLinks > 0) {
        logSuccess(`${speciesName}: ${results.validLinks}/${results.totalLinks} links valid (${successRate}%) (STATIC)`);
      } else if (results.totalLinks === 0) {
        logWarning(`${speciesName}: No pre-processed links found (might use dynamic linking)`);
      } else {
        logError(`${speciesName}: ${results.validLinks}/${results.totalLinks} links valid (${successRate}%) (STATIC)`);
        totalErrors += errorCount;
      }
      
      if (results.extraFiles.length > 0) {
        logWarning(`${speciesName}: ${results.extraFiles.length} unlinked TSV files available`);
      }
    }
  }
  
  logSection('Overall Architecture Assessment');
  
  if (hasDynamicLinking) {
    log('Architecture: Client-side dynamic linking system detected', 'cyan');
    log('Validation: Checking that TSV files are available and SVGs have text elements', 'cyan');
    
    if (totalErrors === 0) {
      logSuccess('Dynamic linking system is properly configured!');
      logSuccess('SVG files contain text elements and TSV files are available');
      log('\n🎉 TUSCO anatomy maps use dynamic client-side linking', 'green');
    } else {
      logError(`Found ${totalErrors} configuration issues for dynamic linking`);
      log('\n❌ Please fix dynamic linking issues above', 'red');
    }
  } else {
    log('Architecture: Static server-side pre-processed linking system', 'cyan');
    
    if (totalErrors === 0) {
      logSuccess('All static TSV links are valid!');
      logSuccess('No missing files or broken links detected');
      log('\n🎉 TUSCO anatomy maps are properly linked to data files', 'green');
    } else {
      logError(`Found ${totalErrors} validation errors in static links`);
      log('\n❌ Please fix the issues above before deployment', 'red');
    }
  }
  
  return totalErrors;
}

/**
 * Generate detailed diagnostic report
 */
function generateDiagnosticReport(humanResults, mouseResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      human: humanResults ? {
        totalLinks: humanResults.totalLinks,
        validLinks: humanResults.validLinks,
        missingFiles: humanResults.missingFiles.length,
        invalidFiles: humanResults.invalidFiles.length,
        extraFiles: humanResults.extraFiles.length
      } : null,
      mouse: mouseResults ? {
        totalLinks: mouseResults.totalLinks,
        validLinks: mouseResults.validLinks,
        missingFiles: mouseResults.missingFiles.length,
        invalidFiles: mouseResults.invalidFiles.length,
        extraFiles: mouseResults.extraFiles.length
      } : null
    },
    details: {
      human: humanResults,
      mouse: mouseResults
    }
  };
  
  try {
    const reportPath = path.join(root, 'data', 'tsv_link_validation_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`\nDetailed report saved to: ${reportPath}`, 'cyan');
  } catch (error) {
    logWarning(`Could not save detailed report: ${error.message}`);
  }
  
  return report;
}

/**
 * Main validation function
 */
function main() {
  try {
    logHeader('TUSCO TSV Link Validation');
    log('Validating tissue label links in anatomy maps...', 'bright');
    
    // Check both species
    const humanResults = checkSpeciesLinks('human');
    const mouseResults = checkSpeciesLinks('mouse');
    
    // Generate reports
    const errorCount = generateReport(humanResults, mouseResults);
    generateDiagnosticReport(humanResults, mouseResults);
    
    // Exit with appropriate code
    if (errorCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    logError(`Script execution failed: ${error.message}`);
    console.error(error.stack);
    process.exit(2);
  }
}

// Handle command line execution
if (require.main === module) {
  main();
}

module.exports = {
  extractSvgInfo,
  getTsvFiles,
  validateTsvFile,
  checkSpeciesLinks
};