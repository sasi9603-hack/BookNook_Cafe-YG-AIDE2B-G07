const { runGuestTests } = require('./guest.test');
const { runGameTests } = require('./game.test');
const { runBookingTests } = require('./booking.test');
const { runAuditTests } = require('./audit.test');
const { initDatabase } = require('../database/init');

async function runAll() {
    console.log('====================================================');
    console.log(' STARTING BOOKNOOK CAFE AUTOMATED TEST SUITE');
    console.log('====================================================');

    const startTime = Date.now();

    try {
        await runGuestTests();
        await runGameTests();
        await runBookingTests();
        await runAuditTests();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('\n====================================================');
        console.log(` ALL TEST SUITES PASSED SUCCESSFULLY! (${duration}s)`);
        console.log(' [✔] Guests API & Validation');
        console.log(' [✔] Games API, Players Search & Validation');
        console.log(' [✔] Bookings Lifecycle, Transactions & SQL JOIN');
        console.log(' [✔] Audit Trail Ordering, Limit & Consistency');
        console.log('====================================================');

        initDatabase();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ TEST RUNNER FAILED:');
        console.error(error);
        process.exit(1);
    }
}

runAll();
