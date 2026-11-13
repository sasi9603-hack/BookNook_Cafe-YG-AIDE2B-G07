const db = require('../database/db');

function getAllGuests(req, res, next) {
    try {
        const stmt = db.prepare('SELECT guest_id, name, phone FROM guests ORDER BY guest_id ASC;');
        const guests = stmt.all();

        return res.status(200).json({
            success: true,
            message: 'Guests retrieved successfully.',
            count: guests.length,
            data: guests
        });
    } catch (error) {
        next(error);
    }
}

function getGuestById(req, res, next) {
    try {
        const { id } = req.params;
        const stmt = db.prepare('SELECT guest_id, name, phone FROM guests WHERE guest_id = ?;');
        const guest = stmt.get(id);

        if (!guest) {
            return res.status(404).json({
                success: false,
                message: `Guest with ID ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Guest retrieved successfully.',
            data: guest
        });
    } catch (error) {
        next(error);
    }
}

function createGuest(req, res, next) {
    try {
        const { name, phone } = req.body;

        if (phone) {
            const existingPhone = db.prepare('SELECT guest_id FROM guests WHERE phone = ?;').get(phone);
            if (existingPhone) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number already registered to another guest.'
                });
            }
        }

        const stmt = db.prepare(`
            INSERT INTO guests (name, phone)
            VALUES (?, ?);
        `);

        const info = stmt.run(name, phone || null);

        const newGuest = db.prepare('SELECT guest_id, name, phone FROM guests WHERE guest_id = ?;').get(info.lastInsertRowid);

        return res.status(201).json({
            success: true,
            message: 'Guest created successfully.',
            data: newGuest
        });
    } catch (error) {
        next(error);
    }
}

function updateGuest(req, res, next) {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;

        const existingGuest = db.prepare('SELECT guest_id, name, phone FROM guests WHERE guest_id = ?;').get(id);
        if (!existingGuest) {
            return res.status(404).json({
                success: false,
                message: `Guest with ID ${id} not found.`
            });
        }

        if (phone && phone !== existingGuest.phone) {
            const duplicatePhone = db.prepare('SELECT guest_id FROM guests WHERE phone = ? AND guest_id != ?;').get(phone, id);
            if (duplicatePhone) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number is already in use by another guest.'
                });
            }
        }

        const updatedName = name !== undefined ? name : existingGuest.name;
        const updatedPhone = phone !== undefined ? phone : existingGuest.phone;

        db.prepare(`
            UPDATE guests
            SET name = ?, phone = ?
            WHERE guest_id = ?;
        `).run(updatedName, updatedPhone, id);

        const updatedGuest = db.prepare('SELECT guest_id, name, phone FROM guests WHERE guest_id = ?;').get(id);

        return res.status(200).json({
            success: true,
            message: 'Guest updated successfully.',
            data: updatedGuest
        });
    } catch (error) {
        next(error);
    }
}

function deleteGuest(req, res, next) {
    try {
        const { id } = req.params;

        const existingGuest = db.prepare('SELECT guest_id FROM guests WHERE guest_id = ?;').get(id);
        if (!existingGuest) {
            return res.status(404).json({
                success: false,
                message: `Guest with ID ${id} not found.`
            });
        }

        const activeBooking = db.prepare(`
            SELECT booking_id FROM bookings WHERE guest_id = ? AND status = 'active';
        `).get(id);

        if (activeBooking) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete guest: guest has an active board game booking.'
            });
        }

        const pastBookings = db.prepare(`
            SELECT COUNT(*) AS count FROM bookings WHERE guest_id = ?;
        `).get(id);

        if (pastBookings.count > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete guest: guest has historical booking records.'
            });
        }

        db.prepare('DELETE FROM guests WHERE guest_id = ?;').run(id);

        return res.status(200).json({
            success: true,
            message: `Guest with ID ${id} deleted successfully.`
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllGuests,
    getGuestById,
    createGuest,
    updateGuest,
    deleteGuest
};
