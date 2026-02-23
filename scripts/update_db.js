const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Adjust path to .env

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_clinic'
};

async function updateDatabase() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const alterQueries = [
            `ALTER TABLE consultations ADD COLUMN IF NOT EXISTS history_of_presenting_complaints text DEFAULT NULL AFTER chief_complaints`,
            `ALTER TABLE consultations ADD COLUMN IF NOT EXISTS current_situation text DEFAULT NULL AFTER history_of_presenting_complaints`,
            `ALTER TABLE consultations ADD COLUMN IF NOT EXISTS examination text DEFAULT NULL AFTER current_situation`,
            `ALTER TABLE consultations ADD COLUMN IF NOT EXISTS opinion_and_plan text DEFAULT NULL AFTER treatment_plan`
        ];

        for (const query of alterQueries) {
            try {
                await connection.query(query);
                console.log(`Executed: ${query.substring(0, 50)}...`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists (skipped): ${query.split('ADD COLUMN ')[1].split(' ')[0]}`);
                } else {
                    console.error(`Error executing query: ${query}`, err.message);
                }
            }
        }

        console.log('Database update completed successfully.');

    } catch (error) {
        console.error('Database update failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateDatabase();
