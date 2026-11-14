const assert = require('assert');
const { TestServer } = require('./testHelper');

async function runGuestTests() {
    console.log('\n--- Running Guest Tests ---');
    const runner = new TestServer();
    await runner.start();
    runner.resetDatabase();

    try {
        const resCreate = await runner.request('POST', '/guests', {
            name: 'Alice Johnson',
            phone: '9876543210'
        });
        assert.strictEqual(resCreate.status, 201, 'Should return 201 on guest creation');
        assert.strictEqual(resCreate.body.success, true);
        assert.strictEqual(resCreate.body.data.name, 'Alice Johnson');
        const guestId = resCreate.body.data.guest_id;
        console.log(' PASS: POST /guests creates guest (201)');

        const resNoName = await runner.request('POST', '/guests', { phone: '1111111111' });
        assert.strictEqual(resNoName.status, 400, 'Should reject missing name with 400');
        console.log(' PASS: POST /guests rejects missing name (400)');

        const resDupPhone = await runner.request('POST', '/guests', {
            name: 'Alice Clone',
            phone: '9876543210'
        });
        assert.strictEqual(resDupPhone.status, 409, 'Should reject duplicate phone with 409');
        console.log(' PASS: POST /guests rejects duplicate phone (409)');

        const resList = await runner.request('GET', '/guests');
        assert.strictEqual(resList.status, 200);
        assert.strictEqual(resList.body.count, 1);
        console.log(' PASS: GET /guests lists all guests (200)');

        const resGetOne = await runner.request('GET', `/guests/${guestId}`);
        assert.strictEqual(resGetOne.status, 200);
        assert.strictEqual(resGetOne.body.data.name, 'Alice Johnson');
        console.log(' PASS: GET /guests/:id retrieves guest (200)');

        const resGet404 = await runner.request('GET', '/guests/9999');
        assert.strictEqual(resGet404.status, 404);
        console.log(' PASS: GET /guests/:id returns 404 for non-existent guest');

        const resGetInvalid = await runner.request('GET', '/guests/abc');
        assert.strictEqual(resGetInvalid.status, 400);
        console.log(' PASS: GET /guests/:id returns 400 for non-integer id');

        const resUpdate = await runner.request('PUT', `/guests/${guestId}`, {
            name: 'Alice J. Smith',
            phone: '9876543299'
        });
        assert.strictEqual(resUpdate.status, 200);
        assert.strictEqual(resUpdate.body.data.name, 'Alice J. Smith');
        console.log(' PASS: PUT /guests/:id updates guest (200)');

        const resDelete = await runner.request('DELETE', `/guests/${guestId}`);
        assert.strictEqual(resDelete.status, 200);
        console.log(' PASS: DELETE /guests/:id deletes guest (200)');

        const resVerify = await runner.request('GET', `/guests/${guestId}`);
        assert.strictEqual(resVerify.status, 404);
        console.log(' PASS: Deleted guest is confirmed 404');

        return true;
    } finally {
        await runner.stop();
    }
}

if (require.main === module) {
    runGuestTests()
        .then(() => console.log('\n All Guest tests passed!'))
        .catch(err => {
            console.error('\n Guest test failed:', err);
            process.exit(1);
        });
}

module.exports = { runGuestTests };
