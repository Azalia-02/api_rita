require('dotenv').config(); // Importar dotenv
const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos exitosa');
});

// ✅ Promisificar la conexión para usar async/await
const queryAsync = util.promisify(connection.query).bind(connection);

module.exports = { connection, queryAsync };
