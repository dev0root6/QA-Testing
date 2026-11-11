// Usage: DATABASE_URL=... npm run db:reset   (drops all tables and reloads the campus dataset)
import { initDatabase, getPool } from '../lib/db.js';
await initDatabase({ reset: true });
await getPool().end();
console.log('Database reset complete.');
