const db = require('../database/db');

function getAllBookings(req, res, next) {
    try {
        const stmt = db.prepare(`
            SELECT booking_id, guest_id, game_id, booking_time, status
            FROM bookings
            ORDER BY booking_id DESC;
        `);
        const bookings = stmt.all();

        return res.status(200).json({
            success: true,
            message: 'All bookings retrieved successfully.',
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
}

function getBookingDetails(req, res, next) {
    try {
        const query = `
            SELECT 
                b.booking_id,
                g.name AS guest_name,
                gm.name AS game_name,
                b.booking_time,
                b.status AS booking_status
            FROM bookings b
            INNER JOIN guests g ON b.guest_id = g.guest_id
            INNER JOIN games gm ON b.game_id = gm.game_id
            ORDER BY b.booking_id DESC;
        `;

        const details = db.prepare(query).all();

        return res.status(200).json({
            success: true,
            message: 'Booking details with guest and game information retrieved successfully.',
            count: details.length,
            data: details
        });
    } catch (error) {
        next(error);
    }
}

function createBooking(req, res, next) {
    try {
        const { guest_id, game_id } = req.body;

        const guest = db.prepare('SELECT guest_id, name FROM guests WHERE guest_id = ?;').get(guest_id);
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: `Referenced guest with ID ${guest_id} does not exist.`
            });
        }

        const game = db.prepare('SELECT game_id, name, status FROM games WHERE game_id = ?;').get(game_id);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: `Referenced game with ID ${game_id} does not exist.`
            });
        }

        if (game.status !== 'available') {
            return res.status(409).json({
                success: false,
                message: `Game '${game.name}' is currently in use and cannot be booked.`
            });
        }

        const activeBooking = db.prepare(`
            SELECT booking_id FROM bookings WHERE game_id = ? AND status = 'active';
        `).get(game_id);

        if (activeBooking) {
            return res.status(409).json({
                success: false,
                message: `Game '${game.name}' already has an active booking (ID: ${activeBooking.booking_id}).`
            });
        }

        const bookingTime = new Date().toISOString();

        const createBookingTransaction = db.transaction((gId, gmId, bTime) => {
            const insertStmt = db.prepare(`
                INSERT INTO bookings (guest_id, game_id, booking_time, status)
                VALUES (?, ?, ?, 'active');
            `);
            const info = insertStmt.run(gId, gmId, bTime);

            db.prepare(`
                UPDATE games
                SET status = 'in_use'
                WHERE game_id = ?;
            `).run(gmId);

            return db.prepare(`
                SELECT booking_id, guest_id, game_id, booking_time, status
                FROM bookings
                WHERE booking_id = ?;
            `).get(info.lastInsertRowid);
        });

        const newBooking = createBookingTransaction(guest_id, game_id, bookingTime);

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully and game status set to in_use.',
            data: newBooking
        });
    } catch (error) {
        next(error);
    }
}

function completeBooking(req, res, next) {
    try {
        const { id } = req.params;

        const booking = db.prepare(`
            SELECT booking_id, guest_id, game_id, booking_time, status
            FROM bookings
            WHERE booking_id = ?;
        `).get(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `Booking with ID ${id} not found.`
            });
        }

        if (booking.status === 'completed') {
            return res.status(409).json({
                success: false,
                message: `Booking with ID ${id} is already completed.`
            });
        }

        const completeBookingTransaction = db.transaction((bId, gmId) => {
            db.prepare(`
                UPDATE bookings
                SET status = 'completed'
                WHERE booking_id = ?;
            `).run(bId);

            db.prepare(`
                UPDATE games
                SET status = 'available'
                WHERE game_id = ?;
            `).run(gmId);

            return db.prepare(`
                SELECT booking_id, guest_id, game_id, booking_time, status
                FROM bookings
                WHERE booking_id = ?;
            `).get(bId);
        });

        const updatedBooking = completeBookingTransaction(id, booking.game_id);

        return res.status(200).json({
            success: true,
            message: 'Booking completed successfully and game status restored to available.',
            data: updatedBooking
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllBookings,
    getBookingDetails,
    createBooking,
    completeBooking
};
