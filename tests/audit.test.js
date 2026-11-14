const assert = require('assert');
const { TestServer } = require('./testHelper');

async function runAuditTests() {
    console.log('\n--- Running Audit Trail Assignment Tests ---');
    const runner = new TestServer();
    await runner.start();
    runner.resetDatabase();

    try {
        const resCreate = await runner.request('POST', '/games', {
            name: 'Monopoly',
            players: 6
        });
        assert.strictEqual(resCreate.status, 201, 'TEST 1: POST /games must return 201');
        const gameId = resCreate.body.data.game_id;
        console.log(' PASS: TEST 1: POST /games returned 201 Created');

        const resUpdate = await runner.request('PUT', `/games/${gameId}`, {
            name: 'Monopoly Classic Edition',
            players: 6
        });
        assert.strictEqual(resUpdate.status, 200, 'TEST 2: PUT /games/:id must return 200');
        console.log(' PASS: TEST 2: PUT /games/:id returned 200 OK');

        const resAudit1 = await runner.request('GET', '/audit');
        assert.strictEqual(resAudit1.status, 200, 'TEST 3: GET /audit must return 200');
        assert.strictEqual(resAudit1.body.count, 2, 'Exactly 2 audit records must exist at this stage');
        assert.strictEqual(resAudit1.body.data[0].action, 'UPDATE', 'Newest audit record must be UPDATE');
        assert.strictEqual(resAudit1.body.data[0].game_id, gameId);
        assert.strictEqual(resAudit1.body.data[1].action, 'CREATE', 'Older audit record must be CREATE');
        assert.strictEqual(resAudit1.body.data[1].game_id, gameId);
        assert.ok(resAudit1.body.data[0].audit_id > resAudit1.body.data[1].audit_id, 'audit_id must be in descending order');
        console.log(' PASS: TEST 3: GET /audit returned both records in newest-first order');

        const resDelete = await runner.request('DELETE', `/games/${gameId}`);
        assert.strictEqual(resDelete.status, 200, 'DELETE /games/:id must return 200');
        console.log(' PASS: DELETE /games/:id returned 200 OK');

        const resAudit2 = await runner.request('GET', '/audit');
        assert.strictEqual(resAudit2.status, 200);
        assert.strictEqual(resAudit2.body.count, 3);
        assert.strictEqual(resAudit2.body.data[0].action, 'DELETE', 'Newest audit record must be DELETE');
        assert.strictEqual(resAudit2.body.data[0].game_id, gameId);
        assert.strictEqual(resAudit2.body.data[1].action, 'UPDATE');
        assert.strictEqual(resAudit2.body.data[2].action, 'CREATE');
        console.log(' PASS: Audit trail contains full lifecycle: CREATE -> UPDATE -> DELETE (in reverse chronological order)');

        for (let i = 1; i <= 10; i++) {
            await runner.request('POST', '/games', {
                name: `Game ${i}`,
                players: 2
            });
        }
        const resAuditCap = await runner.request('GET', '/audit');
        assert.strictEqual(resAuditCap.status, 200);
        assert.strictEqual(resAuditCap.body.data.length, 10, 'GET /audit must return at most 10 records');
        console.log(' PASS: GET /audit enforces LIMIT 10 correctly');

        return true;
    } finally {
        await runner.stop();
    }
}

if (require.main === module) {
    runAuditTests()
        .then(() => console.log('\n All Audit Trail tests passed!'))
        .catch(err => {
            console.error('\n Audit Trail test failed:', err);
            process.exit(1);
        });
}

module.exports = { runAuditTests };
