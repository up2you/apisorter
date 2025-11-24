import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import EmbeddedPostgres from 'embedded-postgres';

const DATA_DIR = path.join(process.cwd(), 'data', 'db');
const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54330/apisorter';
const DATABASE_URL = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

const pg = new EmbeddedPostgres({
  username: 'postgres',
  password: 'postgres',
  port: 54330,
  databaseDir: DATA_DIR,
  persistent: true,
  onLog: (msg) => process.stdout.write(`[postgres] ${msg}`),
  onError: (msg) => process.stderr.write(`[postgres:error] ${msg}`),
});

async function start() {
  const dirExists = fs.existsSync(DATA_DIR);

  if (!dirExists) {
    fs.mkdirSync(path.dirname(DATA_DIR), { recursive: true });
    try {
      await pg.initialise();
      console.log('[dev-db] database directory initialised at', DATA_DIR);
    } catch (error) {
      console.error('[dev-db] initialise failed', error);
      process.exit(1);
    }
  } else {
    console.log('[dev-db] reusing existing database directory at', DATA_DIR);
  }

  await pg.start();
  console.log('[dev-db] Embedded Postgres running on postgresql://postgres:postgres@127.0.0.1:54330/');

  const env = { ...process.env, DATABASE_URL };
  try {
    console.log('[dev-db] syncing Prisma schema...');
    execSync('npx prisma db push', { stdio: 'inherit', env });
    console.log('[dev-db] seeding database...');
    execSync('node prisma/seed.js', { stdio: 'inherit', env });
    console.log('[dev-db] database ready.');
  } catch (error) {
    console.error('[dev-db] prisma sync failed', error);
  }
}

async function stop() {
  console.log('\n[dev-db] stopping embedded postgres...');
  await pg.stop();
  console.log('[dev-db] stopped');
  process.exit(0);
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    stop().catch((error) => {
      console.error('[dev-db] failed to stop', error);
      process.exit(1);
    });
  });
});

start().catch((error) => {
  console.error('[dev-db] failed to start', error);
  process.exit(1);
});

setInterval(() => {}, 1 << 30);

