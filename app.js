const express = require('express');
const { port } = require('./config.json');
const app = express();
const session = require('express-session');
const passport = require('passport');
const discordStrategy = require('./strategies/discordstrategy');
const db = require('./database/database');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

db.then(() => console.log('Connected to MongoDB')).catch(err => console.log(err));

// Routes
const authRoute = require('./routes/auth');
const profileRoute = require('./routes/profile');
const dashboardRoute = require('./routes/dashboard');
const divisionRoute = require('./routes/divisions');

app.use(session({
    secret: 'some random secret',
    cookie: {
        maxAge: 14400000
    },
    saveUninitialized: false,
    name: 'discord.oauth2'
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Passport

app.use(passport.initialize());
app.use(passport.session());

// Middleware Routes
app.use('/auth', authRoute);
app.use('/profile', profileRoute);
app.use('/dashboard', dashboardRoute);
app.use('/divisions', divisionRoute);

app.get('/', (req, res) => {
    res.render('home', {
        user: req.user
    });
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));