const EmbeddedPostgres = require('embedded-postgres').default;

async function startDb() {
    console.log('Starting embedded Postgres on port 54330 using ./data/db ...');

    const pg = new EmbeddedPostgres({
        port: 54330,
        databaseDir: './data/db', // Use the existing data directory
        user: 'postgres',
        password: 'postgres',
        dbName: 'apisorter',
        persistent: true,
    });

    await pg.initialise();
    await pg.start();

    console.log('Database started successfully on port 54330!');
    console.log('Connection URL: postgresql://postgres:postgres@localhost:54330/apisorter');

    // Keep the process alive
    process.on('SIGINT', async () => {
        console.log('Stopping database...');
        await pg.stop();
        process.exit(0);
    });
}

startDb().catch(console.error);
