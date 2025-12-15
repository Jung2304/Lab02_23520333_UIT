// Bundle Size Analysis Script
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileSizeInBytes(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function analyzeDirectory(dirPath, indent = '') {
  const files = [];
  let totalSize = 0;

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        const subResult = analyzeDirectory(fullPath, indent + '  ');
        files.push(...subResult.files);
        totalSize += subResult.totalSize;
      } else if (stats.isFile()) {
        const size = stats.size;
        files.push({
          name: item,
          path: fullPath,
          size: size,
          type: path.extname(item),
        });
        totalSize += size;
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }

  return { files, totalSize };
}

function analyzeBundleSize() {
  console.log(`\n${colors.bright}${colors.cyan}📦 Bundle Size Analysis${colors.reset}\n`);

  const distPath = path.resolve(__dirname, '../dist');

  if (!fs.existsSync(distPath)) {
    console.log(`${colors.red}❌ Build directory not found. Run 'npm run build' first.${colors.reset}\n`);
    return;
  }

  const { files, totalSize } = analyzeDirectory(distPath);

  // Group by file type
  const byType = {};
  files.forEach((file) => {
    const type = file.type || 'other';
    if (!byType[type]) {
      byType[type] = { count: 0, size: 0, files: [] };
    }
    byType[type].count++;
    byType[type].size += file.size;
    byType[type].files.push(file);
  });

  // Sort files by size (descending)
  files.sort((a, b) => b.size - a.size);

  // Display results
  console.log(`${colors.bright}Total Bundle Size:${colors.reset} ${colors.green}${formatBytes(totalSize)}${colors.reset}`);
  console.log(`${colors.bright}Total Files:${colors.reset} ${files.length}\n`);

  console.log(`${colors.bright}${colors.yellow}📊 By File Type:${colors.reset}\n`);
  for (const [type, data] of Object.entries(byType)) {
    const percentage = ((data.size / totalSize) * 100).toFixed(1);
    console.log(`  ${colors.cyan}${type.padEnd(10)}${colors.reset} ${data.count} files, ${formatBytes(data.size)} (${percentage}%)`);
  }

  console.log(`\n${colors.bright}${colors.yellow}📁 Top 10 Largest Files:${colors.reset}\n`);
  const top10 = files.slice(0, 10);
  top10.forEach((file, index) => {
    const percentage = ((file.size / totalSize) * 100).toFixed(1);
    const color = percentage > 30 ? colors.red : percentage > 10 ? colors.yellow : colors.green;
    console.log(`  ${(index + 1).toString().padStart(2)}. ${color}${formatBytes(file.size).padEnd(10)}${colors.reset} ${file.name} (${percentage}%)`);
  });

  // Performance recommendations
  console.log(`\n${colors.bright}${colors.blue}💡 Performance Recommendations:${colors.reset}\n`);

  const jsFiles = files.filter((f) => f.type === '.js');
  const jsSize = jsFiles.reduce((sum, f) => sum + f.size, 0);

  if (jsSize > 500 * 1024) {
    console.log(`  ${colors.yellow}⚠${colors.reset}  JavaScript bundle is large (${formatBytes(jsSize)}). Consider code splitting.`);
  } else {
    console.log(`  ${colors.green}✓${colors.reset}  JavaScript bundle size is good (${formatBytes(jsSize)}).`);
  }

  const cssFiles = files.filter((f) => f.type === '.css');
  const cssSize = cssFiles.reduce((sum, f) => sum + f.size, 0);

  if (cssSize > 100 * 1024) {
    console.log(`  ${colors.yellow}⚠${colors.reset}  CSS bundle is large (${formatBytes(cssSize)}). Consider purging unused styles.`);
  } else {
    console.log(`  ${colors.green}✓${colors.reset}  CSS bundle size is good (${formatBytes(cssSize)}).`);
  }

  if (totalSize > 1024 * 1024) {
    console.log(`  ${colors.yellow}⚠${colors.reset}  Total bundle exceeds 1MB. Consider lazy loading and compression.`);
  } else {
    console.log(`  ${colors.green}✓${colors.reset}  Total bundle size is excellent!`);
  }

  console.log();

  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    totalSize: totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    fileCount: files.length,
    byType: Object.fromEntries(
      Object.entries(byType).map(([type, data]) => [
        type,
        {
          count: data.count,
          size: data.size,
          sizeFormatted: formatBytes(data.size),
          percentage: ((data.size / totalSize) * 100).toFixed(2),
        },
      ])
    ),
    largestFiles: top10.map((f) => ({
      name: f.name,
      size: f.size,
      sizeFormatted: formatBytes(f.size),
      percentage: ((f.size / totalSize) * 100).toFixed(2),
    })),
  };

  const reportPath = path.join(distPath, 'bundle-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`${colors.green}✓${colors.reset} Report saved to: ${reportPath}\n`);
}

// Run analysis
analyzeBundleSize();
