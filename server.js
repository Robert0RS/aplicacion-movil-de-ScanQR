const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
const puerto = process.env.PORT || 3000;

// conexion db
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Middleware para validar tipos
const validarTipoContenido = (req, res, next) => {
    if (req.method === 'POST' && !req.is('application/json')) {
        return res.status(415).json({ error: 'El Content-Type debe ser application/json' });
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET /codigos 
app.get('/codigos', (req, res) => {
    db.all('SELECT * FROM codigos ORDER BY created_at DESC', [], (err, filas) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(filas);
    });
});

// GET /codigos/{id} 
app.get('/codigos/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM codigos WHERE id = ?', [id], (err, fila) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!fila) {
            return res.status(404).json({ error: 'Código QR no encontrado' });
        }
        res.json(fila);
    });
});

// POST /codigos 
app.post('/codigos', validarTipoContenido, (req, res) => {
    const { data, type } = req.body;
    
    if (!data || !type) {
        return res.status(400).json({ error: 'Se requieren los campos data y type' });
    }

    const id = uuidv4();
    const sql = 'INSERT INTO codigos (id, data, type) VALUES (?, ?, ?)';
    
    db.run(sql, [id, data, type], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            id,
            data,
            type
        });
    });
});

// DELETE /codigos/{id} 
app.delete('/codigos/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM codigos WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Código QR no encontrado' });
        }
        res.status(204).send();
    });
});

// API endpoint para guardar qrs escaneados
app.post('/api/scan', validarTipoContenido, (req, res) => {
    const { qrData } = req.body;
    const id = uuidv4();
    
    db.run('INSERT INTO codigos (id, data, type) VALUES (?, ?, ?)', 
        [id, qrData, 'qr'], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                success: true, 
                data: {
                    id,
                    data: qrData,
                    type: 'qr'
                }
            });
        }
    );
});

// Iniciar servidor
app.listen(puerto, () => {
    console.log(`El servidor está corriendo en el puerto ${puerto}`);
}); 