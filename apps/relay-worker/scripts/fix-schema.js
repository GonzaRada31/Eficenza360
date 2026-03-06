const fs = require('fs');
const path = require('path');

const apiSchemaPath = path.join(__dirname, '..', '..', 'api', 'prisma', 'schema.prisma');
const localSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

console.log('Reading from:', apiSchemaPath);
let content = fs.readFileSync(apiSchemaPath, 'utf8');

// Replace env with hardcoded string for local worker to avoid dotenv windows parsing errors
content = content.replace('env("DATABASE_URL")', '"postgresql://eficenza:password@localhost:5432/eficenza_db?schema=public"');

// Force pure UTF-8 encoding (no BOM)
console.log('Writing to:', localSchemaPath);
fs.writeFileSync(localSchemaPath, content, { encoding: 'utf8' });

console.log('Done!');
