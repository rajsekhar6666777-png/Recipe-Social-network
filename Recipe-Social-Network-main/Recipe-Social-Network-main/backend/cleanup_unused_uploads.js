const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'config', 'seed.sql');
const uploadsDir = path.join(__dirname, 'uploads');

const seedContent = fs.readFileSync(seedPath, 'utf-8');
const files = fs.readdirSync(uploadsDir);

console.log(`Checking ${files.length} files in backend/uploads...\n`);

let deletedCount = 0;

for (const file of files) {
  if (!seedContent.includes(file)) {
    const filePath = path.join(uploadsDir, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
      console.log(` 🗑️ Removed unused file: ${file}`);
      deletedCount++;
    }
  }
}

console.log(`\n✅ Cleaned up ${deletedCount} unused upload files!`);

process.exit(0);
