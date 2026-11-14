const assert = require('assert');
const { TestServer } = require('./testHelper');

async function runBookingTests() {
    console.log('\n--- Running Booking Lifecycle & JOIN Tests ---');
    const runner = new TestServer();
    await runner.start();
    runner.resetDatabase();

    try {
        const resGuest = await runner.request('POST', '/guests', {
            name: 'Bob Martin',
            phone: '9988776655'
        });
        const guestId = resGuest.body.data.guest_id;

        const resGame = await runner.request('POST', '/games', {
            name: 'Scrabble',
            players: 4
        });
        const gameId = resGame.body.data.game_id;

        const resGameCheck1 = await runner.request('GET', `/games/${gameId}`);
        assert.strictEqual(resGameCheck1.body.data.status, 'available');
        console.log(' PASS: Game starts in "available" status');

        const resBooking = await runner.request('POST', '/bookings', {
            guest_id: guestId,
            game_id: gameId
        });
        assert.strictEqual(resBooking.status, 201);
        assert.strictEqual(resBooking.body.success, true);
        assert.strictEqual(resBooking.body.data.status, 'active');
        const bookingId = resBooking.body.data.booking_id;
        console.log(' PASS: POST /bookings creates active booking (201)');

        const resGameCheck2 = await runner.request('GET', `/games/${gameId}`);
        assert.strictEqual(resGameCheck2.body.data.status, 'in_use');
        console.log(' PASS: Game status transitioned atomically to "in_use"');

        const resDuplicateBooking = await runner.request('POST', '/bookings', {
            guest_id: guestId,
            game_id: gameId
        });
        assert.strictEqual(resDuplicateBooking.status, 409);
        console.log(' PASS: POST /bookings blocks booking a game already in use (409)');

        const resGhostGuest = await runner.request('POST', '/bookings', {
            guest_id: 9999,
            game_id: gameId
        });
        assert.strictEqual(resGhostGuest.status, 404);
        console.log(' PASS: POST /bookings returns 404 for non-existent guest');

        const resGhostGame = await runner.request('POST', '/bookings', {
            guest_id: guestId,
            game_id: 9999
        });
        assert.strictEqual(resGhostGame.status, 404);
        console.log(' PASS: POST /bookings returns 404 for non-existent game');

        const resBlockGameDelete = await runner.request('DELETE', `/games/${gameId}`);
        assert.strictEqual(resBlockGameDelete.status, 409);
        console.log(' PASS: DELETE /games/:id blocks deletion while active booking exists (409)');

        const resBlockGuestDelete = await runner.request('DELETE', `/guests/${guestId}`);
        assert.strictEqual(resBlockGuestDelete.status, 409);
        console.log(' PASS: DELETE /guests/:id blocks deletion while active booking exists (409)');

        const resJoin = await runner.request('GET', '/bookings/details');
        assert.strictEqual(resJoin.status, 200);
        assert.strictEqual(resJoin.body.success, true);
        assert.strictEqual(resJoin.body.count, 1);
        const detail = resJoin.body.data[0];
        assert.strictEqual(detail.booking_id, bookingId);
        assert.strictEqual(detail.guest_name, 'Bob Martin');
        assert.strictEqual(detail.game_name, 'Scrabble');
        assert.strictEqual(detail.booking_status, 'active');
        assert.ok(detail.booking_time, 'booking_time must exist');
        console.log(' PASS: GET /bookings/details returns complete SQL INNER JOIN record');

        const resComplete = await runner.request('PUT', `/bookings/${bookingId}/complete`);
        assert.strictEqual(resComplete.status, 200);
        assert.strictEqual(resComplete.body.data.status, 'completed');
        console.log(' PASS: PUT /bookings/:id/complete marks booking completed (200)');

        const resGameCheck3 = await runner.request('GET', `/games/${gameId}`);
        assert.strictEqual(resGameCheck3.body.data.status, 'available');
        console.log(' PASS: Game status restored atomically to "available"');

        const resAlreadyCompleted = await runner.request('PUT', `/bookings/${bookingId}/complete`);
        assert.strictEqual(resAlreadyCompleted.status, 409);
        console.log(' PASS: PUT /bookings/:id/complete blocks completing an already completed booking (409)');

        const resGhostBooking = await runner.request('PUT', '/bookings/9999/complete');
        assert.strictEqual(resGhostBooking.status, 404);
        console.log(' PASS: PUT /bookings/:id/complete returns 404 for non-existent booking');

        return true;
    } finally {
        await runner.stop();
    }
}

if (require.main === module) {
    runBookingTests()
        .then(() => console.log('\n All Booking tests passed!'))
        .catch(err => {
            console.error('\n Booking test failed:', err);
            process.exit(1);
        });
}

module.exports = { runBookingTests };
