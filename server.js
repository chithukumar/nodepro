// Import required modules
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Import dotenv for environment variables

const app = express();

// Middleware to parse request body and handle CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// MySQL database connection using environment variables
const db = mysql.createConnection({
    port: 3306,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mysql', // Use .env file for security
    database: process.env.DB_DATABASE || 'donation_system'
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Serve static files from the public directory (for serving HTML files)
app.use(express.static('public'));

// Route to handle root URL and serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route to handle donor signup
app.post('/donor_signup', async (req, res) => {
    const { name, email, password, location, mobile_number } = req.body;

    // Input validation
    if (!name || !email || !password || !location || !mobile_number) {
        return res.status(400).send('All fields are required!');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert data into 'donors' table
        const query = 'INSERT INTO donors (name, email, password, location, mobile_number) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [name, email, hashedPassword, location, mobile_number], (err, result) => {
            if (err) {
                console.error('Error signing up:', err);
                return res.status(500).send('Error signing up: ' + err.message);
            }
            res.send('Donor signed up successfully!');
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Server error');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});