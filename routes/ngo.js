const express = require('express');
const router = express.Router();
const { 
  getAvailableListings,
  requestPickup,
  getMyRequests,
  updateRequestStatus
} = require('../controllers/ngoController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ngo'));

router.get('/listings', getAvailableListings);
router.post('/request/:listingId', requestPickup);
router.get('/my-requests', getMyRequests);
router.put('/request/:id', updateRequestStatus);

module.exports = router;
