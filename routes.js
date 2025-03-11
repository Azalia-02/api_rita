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


// Obtener todos los medicos con paginación y búsqueda
router.get('/medicos', (req, res) => {
    const search = req.query.search || '';  // Texto de búsqueda
    const page = parseInt(req.query.page) || 1;  // Página actual
    const limit = parseInt(req.query.limit) || 6; // Registros por página
    const offset = (page - 1) * limit;  // Calcular desde qué registro comenzar

    // Consulta con búsqueda y paginación
    const query = `
        SELECT * FROM tb_medicos 
        WHERE nombre LIKE ? 
        LIMIT ? OFFSET ?`;
    
    const countQuery = `SELECT COUNT(*) AS total FROM tb_medicos WHERE nombre LIKE ?`;

    connection.query(query, [`%${search}%`, limit, offset], (err, results) => {
        if (err) {
            console.error('Error al obtener medicos:', err);
            return res.status(500).json({ error: 'Error al obtener medicos' });
        }

        connection.query(countQuery, [`%${search}%`], (err, countResults) => {
            if (err) {
                console.error('Error al contar medicos:', err);
                return res.status(500).json({ error: 'Error al contar medicos' });
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

// Obtener un medico por ID
router.get('/medicos/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM tb_medicos WHERE id_medico = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el medico:', err);
            return res.status(500).json({ error: 'Error al obtener el medico' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Medico no encontrado' });
        }
        res.json(results[0]);
    });
});

// Crear un nuevo medico
router.post('/medicos', (req, res) => {
    const nuevoMedico = req.body;
    connection.query('INSERT INTO tb_medicos SET ?', nuevoMedico, (err, results) => {
        if (err) {
            console.error('Error al crear medico:', err);
            return res.status(500).json({ error: 'Error al crear medico' });
        }
        res.status(201).json({ message: 'Medico creado exitosamente' });
    });
});

// Actualizar un medico
router.put('/medicos/:id', (req, res) => {
    const id = req.params.id;
    const datosActualizados = req.body;
    connection.query('UPDATE tb_medicos SET ? WHERE id_medico = ?', [datosActualizados, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar medico:', err);
            return res.status(500).json({ error: 'Error al actualizar medico' });
        }
        res.json({ message: 'Medico actualizado exitosamente' });
    });
});

// Eliminar un medico
router.delete('/medicos/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM tb_medicos WHERE id_medico = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar medico:', err);
            return res.status(500).json({ error: 'Error al eliminar medico' });
        }
        res.json({ message: 'Medico eliminado exitosamente' });
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
    console.log(req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Errores de validación', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { password, ...rest } = req.body;

    try {
        const hashPassword = async (password) => {
            console.error
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