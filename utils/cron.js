const cron = require('node-cron');
const FoodListing = require('../models/FoodListing');

const startCronJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[Cron] Running expiry check for food listings...');
      const now = new Date();
      
      const result = await FoodListing.updateMany(
        {
          status: 'active',
          expiryDateTime: { $lt: now }
        },
        {
          $set: { status: 'expired' }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`[Cron] Marked ${result.modifiedCount} food listings as expired.`);
      }
    } catch (error) {
      console.error('[Cron Error] Failed to update expired listings:', error);
    }
  });
};

module.exports = { startCronJobs };
