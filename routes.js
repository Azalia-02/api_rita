const express = require('express');
const router = express.Router();
const connection = require('./db');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const saltRounds = 10;

router.get('/registros', (req, res) => {
    connection.query('SELECT * FROM tb_login', (err, results) => {
        if (err) {
            console.error('Error al obtener registros:', err );
            res.status(500).json({ error: 'Error al obtener registros'});
            return;
        }

        if (results.length === 0){
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(results);
    });
});

// Obtener todos los pacientes con paginación y búsqueda
router.get('/pacientes', (req, res) => {
    const search = req.query.search || '';  // Texto de búsqueda
    const page = parseInt(req.query.page) || 1;  // Página actual
    const limit = parseInt(req.query.limit) || 6; // Registros por página
    const offset = (page - 1) * limit;  // Calcular desde qué registro comenzar

    // Consulta con búsqueda y paginación
    const query = `
        SELECT * FROM tb_pacientes 
        WHERE nombre LIKE ? 
        LIMIT ? OFFSET ?`;
    
    const countQuery = `SELECT COUNT(*) AS total FROM tb_pacientes WHERE nombre LIKE ?`;

    connection.query(query, [`%${search}%`, limit, offset], (err, results) => {
        if (err) {
            console.error('Error al obtener pacientes:', err);
            return res.status(500).json({ error: 'Error al obtener pacientes' });
        }

        connection.query(countQuery, [`%${search}%`], (err, countResults) => {
            if (err) {
                console.error('Error al contar pacientes:', err);
                return res.status(500).json({ error: 'Error al contar pacientes' });
            }

            res.json({
                data: results, 
                total: countResults[0].total, 
                page, 
                limit
            });
        });
    });
});

// Obtener un paciente por ID
router.get('/pacientes/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM tb_pacientes WHERE id_paciente = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el paciente:', err);
            return res.status(500).json({ error: 'Error al obtener el paciente' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        res.json(results[0]);
    });
});

// Crear un nuevo paciente
router.post('/pacientes', (req, res) => {
    const nuevoPaciente = req.body;
    connection.query('INSERT INTO tb_pacientes SET ?', nuevoPaciente, (err, results) => {
        if (err) {
            console.error('Error al crear paciente:', err);
            return res.status(500).json({ error: 'Error al crear paciente' });
        }
        res.status(201).json({ message: 'Paciente creado exitosamente' });
    });
});

// Actualizar un paciente
router.put('/pacientes/:id', (req, res) => {
    const id = req.params.id;
    const datosActualizados = req.body;
    connection.query('UPDATE tb_pacientes SET ? WHERE id_paciente = ?', [datosActualizados, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar paciente:', err);
            return res.status(500).json({ error: 'Error al actualizar paciente' });
        }
        res.json({ message: 'Paciente actualizado exitosamente' });
    });
});

// Eliminar un paciente
router.delete('/pacientes/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM tb_pacientes WHERE id_paciente = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar paciente:', err);
            return res.status(500).json({ error: 'Error al eliminar paciente' });
        }
        res.json({ message: 'Paciente eliminado exitosamente' });
    });
});

//Logeo de usuarios

router.post('/redirige', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Los parámetros email y contraseña son requeridos' });
    }

    try {
        connection.query('SELECT * FROM tb_login WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).json({ error: 'Error al obtener registros' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const user = results[0];

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }

            res.json(user);
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Crear nuevos usuarios

router.post('/registros', async (req, res) => {
    const { nombre, app, apm, email, password, rol } = req.body;

    if (!nombre || !app || !apm || !email || !password || !rol) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password.trim(), 10);

        const query = 'INSERT INTO tb_login (nombre, app, apm, email, password, rol, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [nombre, app, apm, email, hashedPassword, rol, new Date(), new Date()];

        connection.query(query, values, (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).json({ error: 'Error al registrar el usuario' });
            }

            res.json({ success: true, message: 'Usuario registrado exitosamente' });
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;