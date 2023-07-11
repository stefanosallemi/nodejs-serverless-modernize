const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: 'default',
  host: 'ep-jolly-flower-480505-pooler.eu-central-1.postgres.vercel-storage.compostgres://default:1KbqJZdoxP3V@ep-jolly-flower-480505-pooler.eu-central-1.postgres.vercel-storage.com:5432',
  database: 'verceldb',
  password: '1KbqJZdoxP3V',
  port: 5432,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Error connecting to the database:', err);
});

// Genera il token di autenticazione
function generateAuthToken(uname) {
  return jwt.sign({ uname }, 'your-secret-key', { expiresIn: '1h' });
}

app.get('/api', (req, res) => {
console.log('valid connection')
});

app.post('/api/register', (req, res) => {
  const { name, uname, password } = req.body;

  const query = 'INSERT INTO users (name, uname, password) VALUES ($1, $2, $3)';
  const values = [name, uname, password];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Registrazione fallita' });
    } else {
      console.log('User registered successfully');
      res.status(200).json({ message: 'Registrazione avvenuta con successo' });
    }
  });
});

app.post('/api/login', (req, res) => {
  const { uname, password } = req.body;

  const query = 'SELECT * FROM users WHERE uname = $1 AND password = $2';
  const values = [uname, password];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Error verifying user credentials:', error);
      res.status(500).json({ message: 'Errore durante la verifica delle credenziali' });
    } else {
      if (result.rows.length === 1) {
        console.log('User credentials verified successfully');

        // Genera il token di autenticazione
        const token = generateAuthToken(uname);

        res.status(200).json({ message: 'Accesso consentito', token });
      } else {

        console.log('Invalid username or password');
        res.status(401).json({ message: 'Nome utente o password non validi' });
      }
    }
  });
});

app.post('/api/logout', (req, res) => {
  res.redirect(307, '/login');
});

app.get('/api/check-username', (req, res) => {
  const { uname } = req.query;

  const query = 'SELECT COUNT(*) FROM users WHERE uname = $1';
  const values = [uname];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Errore durante il controllo dell\'esistenza dell\'username:', error);
      res.status(500).json({ message: 'Errore durante il controllo dell\'esistenza dell\'username' });
    } else {
      const count = result.rows[0].count;
      const exists = count > 0;

      res.status(200).json({ exists });
    }
  });
});


app.listen(port, () => {
  console.log(`Server ascolta nella porta: ${port}`);
});
