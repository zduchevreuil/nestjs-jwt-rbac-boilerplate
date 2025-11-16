const fs = require('fs-extra');
const path = require('path');

async function copyTemplates() {
  const srcDir = path.join(__dirname, '..', 'templates');
  const destDir = path.join(__dirname, '..', 'dist', 'templates');

  console.log('Copying templates...');
  
  try {
    await fs.ensureDir(destDir);
    await fs.copy(srcDir, destDir, {
      filter: (src) => {
        // Exclude node_modules and other unnecessary files
        return !src.includes('node_modules') && !src.includes('.git');
      },
    });
    console.log('✅ Templates copied successfully');
  } catch (error) {
    console.error('❌ Error copying templates:', error);
    process.exit(1);
  }
}

copyTemplates();
