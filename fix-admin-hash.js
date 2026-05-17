const bcrypt = require('bcryptjs');
const { execFileSync } = require('child_process');

bcrypt.hash('Admin2024', 12).then(hash => {
  console.log('Hash généré:', hash, '| length:', hash.length);
  // Write SQL to a temp file to avoid shell escaping issues
  const sql = `UPDATE users SET password = '${hash}' WHERE email = 'admin@power-exhaust.com';`;
  const fs = require('fs');
  fs.writeFileSync('/tmp/fix-admin.sql', sql);
  execFileSync('sqlite3', ['prisma/dev.db', `.read /tmp/fix-admin.sql`]);
  const result = execFileSync('sqlite3', ['prisma/dev.db', "SELECT email, role, length(password) FROM users WHERE email = 'admin@power-exhaust.com';"]).toString();
  console.log('Résultat:', result.trim());
}).catch(console.error);
