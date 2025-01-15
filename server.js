const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db'); // Import the database utility
const app = express();
require("dotenv").config();
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isEmpty } = require('lodash');
const SECRET_KEY = 'PuclYnXXSGKKCsxPOsrFYO4dx6yx'; // Replace with a secure key in a real app

// Use cookie-parser middleware
app.use(cookieParser());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Heroku provides this variable automatically
  ssl: {
    rejectUnauthorized: false, // Required for Heroku-managed databases
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params), // For running queries
};

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the authenticate middleware

// Middleware to check if the user is authenticated 
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token; // Ensure you have the `cookie-parser` middleware
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = jwt.verify(token, SECRET_KEY);
    req.user = user; // Attach user data to the request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
const checkAuthentication = (req, res, next) => {
  const token = req.cookies.auth_token; // Get token from cookie

  if (!token) {
    return res.redirect('/login'); // Redirect to login if no token
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user data to the request
    next();
  } catch (err) {
    return res.redirect('/login'); // Redirect to login if token is invalid or expired
  }
};




module.exports = authenticate;


function checkAdmin(req, res, next) {
  if (req.user && req.user.isadmin === 1) {
    next();
  } else {
    res.status(403).send('Access denied. Admins only.');
  }
}

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));



// Redirects
app.get('/index', (req, res) => {
    console.log('Redirecting /index.html to /');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard',checkAuthentication, (req, res) => {
    console.log('Redirecting /Dashboard.html to /');
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/calendar',checkAuthentication, (req, res) => {
    console.log('Redirecting /Calendar.html to /');
    res.sendFile(path.join(__dirname, 'public', 'Calendar.html'));
});

app.get('/hours',checkAuthentication, (req, res) => {
    console.log('Redirecting /HourLog.html to /');
    res.sendFile(path.join(__dirname, 'public', 'hourLog.html'));
});
app.get('/discover',checkAuthentication, (req, res) => {
    console.log('Redirecting /DiscoverPage.html to /');
    res.sendFile(path.join(__dirname, 'public', 'DiscoverPage.html'));
});

app.get('/proof',checkAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Proof.html'));
});

app.get('/feedback', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Feedback.html'));
});

app.get('/account',checkAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SignUp.html'));
});

app.get('/organizationEvent',checkAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'organizationEvent.html'));
});
app.get('/test',checkAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});
app.get('/donation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Donation.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/settings',checkAuthentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});


// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail)
  auth: {
      user: 'b89451436@gmail.com', // Your email
      pass: 'xlya jnqx mnqv tenv' // Your email password or app password
  }
});

// Route to handle form submission
app.post('/send-feedback', (req, res) => {
  const { name, email, feedback } = req.body;

  const mailOptions = {
      from: email,
      to: 'ajbd47@gmail.com', // Your email where you want to receive feedback
      subject: `(WeServe) Feedback from ${name}`,
      text: 'You have recieved feedback from '+ name + " and their feedback is: \n" + '"'+feedback+'"',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error sending email:', error); // Log the error
        return res.status(500).json({ error: 'Error sending email: ' + error.message }); // Send detailed error message
    }
    console.log('Email sent: ' + info.response);
    res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
});


app.get('/test-db', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json({
        message: 'Database connection successful!',
        serverTime: result.rows[0].now,
      });
    } catch (err) {
      console.error('Database connection error:', err);
      res.status(500).json({ error: 'Failed to connect to the database.' });
    }
  });
  
  app.get('/test-env', (req, res) => {
    res.json({
      message: 'Environment variables loaded!',
      databaseUrl: process.env.DATABASE_URL ? 'Loaded' : 'Not loaded',
    });
  });
  
  


  
  
  app.post('/registerJS', async (req, res) => {
    const { firstname, lastname, gender, birthday, email, phonenumber, password, isadmin = false, isorg } = req.body;

  
    // Validate input data (basic checks, feel free to extend it)
    if (!email.toLowerCase() || !password || !firstname || !lastname) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const phoneCheck = await pool.query('SELECT * FROM users WHERE phonenumber = $1', [phonenumber]);
        if (phonenumber!=null){
        if (phoneCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Phone number is already in use' });
        }
      }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert user into the database
      const result = await pool.query(
        'INSERT INTO users (firstname, lastname, gender, birthday, email, phonenumber, password, isadmin, isorg) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', 
        [firstname, lastname, gender, birthday, email.toLowerCase(), phonenumber, hashedPassword, isadmin, isorg]
      );
  
      console.log('Registration successful:', result.rows[0]); // Log success
    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]

    }); }
   catch (err) {
    console.error('Error during registration:', error); // Log the error
    res.status(500).json({
      message: 'Error registering user.'
    });
    }
  });

  app.post('/loginJS', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email.toLowerCase() || !password) {
      return res.status(400).send('Email and password are required.');
    }
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  
      if (result.rowCount === 0) {
        return res.status(401).send('Invalid credentials.');
      }
  
      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).send('Invalid credentials.');
      }
  
      // Generate a JWT token
      const token = jwt.sign({ id: user.id, email: user.email.toLowerCase() }, SECRET_KEY, { expiresIn: '168h' });
  
      // Send token as a cookie and respond with success
      res.cookie('auth_token', token, { httpOnly: true,sameSite: 'Strict' });
      console.log("cookie made")
      res.status(200).send('Login successful.');
    } catch (err) {
      console.error('Error logging in:', err);
      res.status(500).send('Error logging in.');
    }
  });
  
  app.post('/profileJS', authenticate, async (req, res) => {
    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      if (user.rowCount === 0) {
        return res.status(404).send('User not found');
      }
      res.json(user.rows[0]); // Send user data
    } catch (err) {
      console.error('Error fetching user data:', err);
      res.status(500).send('Server error');
    }
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('auth_token', { httpOnly: true,sameSite: 'Strict'});
    res.redirect("/login")
  });

  app.post('/api/events', async (req, res) => {
    try {
        const { name, description, event_date, time_range, address, org_name } = req.body;

        if (!time_range || !time_range.includes(' - ')) {
            return res.status(400).json({ error: 'Invalid or missing time range format' });
        }

        const [start_time, end_time] = time_range.split(' - ');

        if (!start_time || !end_time) {
            return res.status(400).json({ error: 'Start time and end time are required' });
        }

        const result = await pool.query(
            `INSERT INTO events (name, description, event_date, start_time, end_time, address, org_name) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [name, description, event_date, start_time, end_time, address, org_name]
        );

        res.status(201).json({ message: 'Event added successfully', eventId: result.insertId });
    } catch (err) {
        console.error('Error saving event:', err);
        res.status(500).json({ error: 'Failed to save event' });
    }
});

async function getEvents() {
  try {
      const response = await fetch('http://localhost:3000/api/events'); // Adjust URL if needed
      if (response.ok) {
          const events = await response.json();
          return events;
      } else {
          console.error('Failed to fetch events', response.statusText);
          return [];
      }
  } catch (err) {
      console.error('Error fetching events:', err);
      return [];
  }
}
async function displayEvents() {
  const events = await getEvents();
  console.log(events); // This will log the events fetched from the database

  // Your code to display events on the page or manipulate them
}


  

module.exports = router;




  // Fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Redirects to homepage for undefined routes
});
// Make the app listen on the port provided by Heroku
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});
