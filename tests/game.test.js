const assert = require('assert');
const { TestServer } = require('./testHelper');

async function runGameTests() {
    console.log('\n--- Running Game Tests ---');
    const runner = new TestServer();
    await runner.start();
    runner.resetDatabase();

    try {
        const resCreate = await runner.request('POST', '/games', {
            name: 'Catan',
            players: 4
        });
        assert.strictEqual(resCreate.status, 201);
        assert.strictEqual(resCreate.body.success, true);
        assert.strictEqual(resCreate.body.data.name, 'Catan');
        assert.strictEqual(resCreate.body.data.players, 4);
        assert.strictEqual(resCreate.body.data.status, 'available');
        const catanId = resCreate.body.data.game_id;
        console.log(' PASS: POST /games creates game with default status "available" (201)');

        const resBadPlayers = await runner.request('POST', '/games', {
            name: 'Bad Game',
            players: -3
        });
        assert.strictEqual(resBadPlayers.status, 400);
        console.log(' PASS: POST /games rejects negative players (400)');

        const resStringPlayers = await runner.request('POST', '/games', {
            name: 'Bad Game 2',
            players: 'four'
        });
        assert.strictEqual(resStringPlayers.status, 400);
        console.log(' PASS: POST /games rejects non-integer players (400)');

        const resCreate2 = await runner.request('POST', '/games', {
            name: 'Chess',
            players: 2
        });
        assert.strictEqual(resCreate2.status, 201);
        const chessId = resCreate2.body.data.game_id;

        const resCreate3 = await runner.request('POST', '/games', {
            name: 'Ticket to Ride',
            players: 4
        });
        assert.strictEqual(resCreate3.status, 201);

        const resList = await runner.request('GET', '/games');
        assert.strictEqual(resList.status, 200);
        assert.strictEqual(resList.body.count, 3);
        console.log(' PASS: GET /games lists all games (200)');

        const resFilter = await runner.request('GET', '/games?players=4');
        assert.strictEqual(resFilter.status, 200);
        assert.strictEqual(resFilter.body.count, 2);
        assert.strictEqual(resFilter.body.data[0].players, 4);
        assert.strictEqual(resFilter.body.data[1].players, 4);
        console.log(' PASS: GET /games?players=4 filters games correctly (200)');

        const resBadFilter = await runner.request('GET', '/games?players=-1');
        assert.strictEqual(resBadFilter.status, 400);
        console.log(' PASS: GET /games?players=-1 rejects invalid query parameter (400)');

        const resGetOne = await runner.request('GET', `/games/${catanId}`);
        assert.strictEqual(resGetOne.status, 200);
        assert.strictEqual(resGetOne.body.data.name, 'Catan');
        console.log(' PASS: GET /games/:id retrieves game (200)');

        const resUpdate = await runner.request('PUT', `/games/${chessId}`, {
            name: 'Speed Chess',
            players: 2
        });
        assert.strictEqual(resUpdate.status, 200);
        assert.strictEqual(resUpdate.body.data.name, 'Speed Chess');
        console.log(' PASS: PUT /games/:id updates game (200)');

        const resBadStatus = await runner.request('PUT', `/games/${chessId}`, {
            status: 'broken'
        });
        assert.strictEqual(resBadStatus.status, 400);
        console.log(' PASS: PUT /games/:id rejects invalid status (400)');

        const resDelete = await runner.request('DELETE', `/games/${chessId}`);
        assert.strictEqual(resDelete.status, 200);
        console.log(' PASS: DELETE /games/:id deletes game (200)');

        const resVerify = await runner.request('GET', `/games/${chessId}`);
        assert.strictEqual(resVerify.status, 404);
        console.log(' PASS: Deleted game is confirmed 404');

        return true;
    } finally {
        await runner.stop();
    }
}

if (require.main === module) {
    runGameTests()
        .then(() => console.log('\n All Game tests passed!'))
        .catch(err => {
            console.error('\n Game test failed:', err);
            process.exit(1);
        });
}

module.exports = { runGameTests };
