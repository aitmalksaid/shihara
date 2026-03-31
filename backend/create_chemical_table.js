const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function createTable() {
    try {
        const sqlContent = fs.readFileSync(path.join(__dirname, 'create_chemical_purchases_table.sql'), 'utf8');

        await sql.connect(config);
        const result = await sql.query(sqlContent);

        console.log('Table AchatsChimiques created or already exists.');
        console.log(result);

    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await sql.close();
    }
}

createTable();
