const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear nueva conexion db
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        process.exit(1);
    }
    console.log('Conectado a la base de datos SQLite');
});

// crea tabla
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS codigos (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error al crear la tabla:', err);
        } else {
            console.log('Tabla "codigos" creada correctamente');
        }
    });
});

// cerrar conexion db
db.close((err) => {
    if (err) {
        console.error('Error al cerrar la base de datos:', err);
    } else {
        console.log('conexion cerrada a la db');
    }
}); 