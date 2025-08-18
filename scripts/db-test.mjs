import { Pool } from 'pg';

function maskUrl(url) {
  try {
    const u = new URL(url);
    if (u.password) {
      u.password = '***';
    }
    if (u.username) {
      u.username = '***';
    }
    return u.toString();
  } catch {
    return 'invalid-url';
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(2);
}

let useSSL = /sslmode=require/.test(url) || /(supabase|neon\.tech)/.test(url);
try {
  const u = new URL(url);
  const host = u.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const sslModeParam = u.searchParams.get('sslmode');
  const envSslMode = process.env.PGSSLMODE;
  const explicitlyDisabled = sslModeParam === 'disable' || envSslMode === 'disable';
  if (!isLocal && !explicitlyDisabled) {
    useSSL = true;
  }
} catch {}

const pool = new Pool({
  connectionString: url,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

console.log('Connecting with:', maskUrl(url));
console.log('SSL enabled:', useSSL);

try {
  const r = await pool.query('select now() as now, current_database() as db');
  console.log('Success:', r.rows[0]);
} catch (e) {
  console.error('Connection error:', e);
  process.exitCode = 1;
} finally {
  await pool.end();
}


