const express = require('express');
const router = express.Router();
const connection = require('./db');

router.get('/registros', (req, res) => {
    connection.query('SELECT * FROM tb_login', (err, results) => {
        if (err) {
            console.error('Error al obtener registros:', err );
            res.status(500).json({ error: 'Error al obtener registros'});
            return;
        }
        res.json(results);
    });
});

module.exports = router;