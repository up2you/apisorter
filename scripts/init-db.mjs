import EmbeddedPostgres from 'embedded-postgres';
import { execSync } from 'child_process';

async function main() {
  const port = 54330;
  const dbName = 'apisorter';
  const username = 'postgres';
  const password = 'postgres';

  const pg = new EmbeddedPostgres({
    database: dbName,
    username,
    password,
    port,
    persistent: false,
  });

  console.log('[init-db] starting embedded postgres...');
  await pg.initialise();
  await pg.start();
  console.log('[init-db] postgres ready');

  const connectionString = `postgresql://${username}:${password}@127.0.0.1:${port}/${dbName}`;
  const env = { ...process.env, DATABASE_URL: connectionString };

  console.log('[init-db] running prisma db push...');
  execSync('npx prisma db push', { stdio: 'inherit', env });

  console.log('[init-db] seeding database...');
  execSync('node prisma/seed.js', { stdio: 'inherit', env });

  console.log('[init-db] cleaning up...');
  await pg.stop();
  console.log('[init-db] done.');
}

main().catch((error) => {
  console.error('[init-db] failed', error);
  process.exitCode = 1;
});

