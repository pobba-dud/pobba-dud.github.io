const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Redirects
app.get('/index.html', (req, res) => {
    console.log('Redirecting /index.html to /');
    res.redirect(301, '/');
});

app.get('/dashboard.html', (req, res) => {
    console.log('Redirecting /Dashboard.html to /');
    res.redirect(301, '/Dashboard');
});

app.get('/calendar.html', (req, res) => {
    console.log('Redirecting /Calendar.html to /');
    res.redirect(301, '/Calendar');
});

app.get('/hourLog.html', (req, res) => {
    console.log('Redirecting /HourLog.html to /');
    res.redirect(301, '/HourLog');
});
app.get('/discover-page', (req, res) => {
    console.log('Redirecting /DiscoverPage.html to /');
    res.redirect(301, '/DiscoverPage');
});

app.get('/Proof.html', (req, res) => {
    res.redirect(301, '/Proof');
});

app.get('/feedback', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Feedback.html'));
});

app.get('/login.html', (req, res) => {
    res.redirect(301, '/Login');
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SignUp.html'));
});

app.get('/organizationEvent', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'organizationEvent.html'));
});
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});
app.get('/donation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Donation.html'));
});
// Fallback route
app.get('*', (req, res) => {
    res.redirect(404, '/'); // Redirects to homepage for undefined routes
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
    res.status(200).send("Success")
});
});

// Make the app listen on the port provided by Heroku
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});
