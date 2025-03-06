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

//Logeo de usuarios

router.post('/redirige', async (req, res) => {
    const { email, password } = req.body;

    console.log('Datos recibidos:', { email, password }); // Depuración

    if (!email || !password) {
        console.error('Faltan parámetros'); //Depuración
        return res.status(400).json({ error: 'Los parámetros email y contraseña son requeridos' });
    }

    try {
        connection.query('SELECT * FROM tb_login WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err); //Depuración
                return res.status(500).json({ error: 'Error al obtener registros' });
            }

            console.log('Resultados de la consulta:', results); //Depuración

            if (results.length === 0) {
                console.error('Usuario no encontrado'); //Depuración
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const user = results[0];
            console.log('Usuario encontrado:', user); //Depuración

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.error('Contraseña incorrecta'); //Depuración
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }

            const { password: _, ...userData } = user;
            res.json({password: user.password});
        });
    } catch (error) {
        console.error('Error en el servidor:', error); //Depuración
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Crear nuevos usuarios

router.post('/registros', [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('app').notEmpty().withMessage('El apellido paterno es requerido'),
    body('apm').notEmpty().withMessage('El apellido materno es requerido'),
    body('email').isEmail().withMessage('El correo electrónico no es válido'),
    body('email').custom(async (email) => {
        const user = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM tb_login WHERE email = ?', [email], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });

        if (user) {
            throw new Error('Este correo electrónico ya está registrado');
        }
    }),
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial'),
    body('rol').isIn(['admin', 'user']).withMessage('El rol no es válido')
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Errores de validación', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { password, ...rest } = req.body;

    try {
        const hashPassword = async (password) => {
            return await bcrypt.hash(password, saltRounds);
        };
        
        const nuevoRegistro = {
            ...rest,
            password: hashPassword,
            created_at: new Date(),
            updated_at: new Date()
        };

        connection.query('INSERT INTO tb_login SET ?', nuevoRegistro, (err, results) => {
            if (err) {
                console.error('Error al crear un nuevo registro:', err);
                return res.status(500).json({
                    error: 'Error al crear un nuevo registro',
                    details: err.message
                });
            }

            res.status(201).json({
                message: 'Registro creado exitosamente',
                userId: results.insertId
            });
        });
    } catch (err) {
        console.error('Error al hashear la contraseña:', err);
        return res.status(500).json({
            error: 'Error al hashear la contraseña',
            details: err.message
        });
    }
});


module.exports = router;