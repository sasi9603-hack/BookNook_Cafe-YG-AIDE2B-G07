const express = require('express');
require('dotenv').config();

const guestRoutes = require('./routes/guestRoutes');
const gameRoutes = require('./routes/gameRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const auditRoutes = require('./routes/auditRoutes');

const notFoundHandler = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to BookNook Cafe API - Board Game Booking Management System',
        version: '1.0.0',
        endpoints: {
            guests: '/guests',
            games: '/games',
            bookings: '/bookings',
            bookingDetails: '/bookings/details',
            audit: '/audit'
        }
    });
});

app.use('/guests', guestRoutes);
app.use('/games', gameRoutes);
app.use('/bookings', bookingRoutes);
app.use('/audit', auditRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
