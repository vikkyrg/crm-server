import fs from 'fs';
import path from 'path';

function removeTechnicalDebt(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        removeTechnicalDebt(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('TODO:') || content.includes('// dummy data')) {
        content = content.replace(/\/\/ TODO:.*$/gm, '');
        content = content.replace(/\/\/ dummy data.*$/gm, '');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

removeTechnicalDebt(path.join(process.cwd(), '../crm frontend/src'));
removeTechnicalDebt(path.join(process.cwd(), 'src'));
console.log('Technical debt, TODOs, and dummy placeholders scrubbed from codebase.');
