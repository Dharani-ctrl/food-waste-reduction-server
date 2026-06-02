const express = require('express');
const router = express.Router();
const { 
  createListing, 
  getMyListings, 
  updateListing, 
  deleteListing,
  getRequestsOnMyListings,
  updateRequestStatus
} = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('donor'));

router.post('/food', createListing);
router.get('/my-listings', getMyListings);
router.put('/food/:id', updateListing);
router.delete('/food/:id', deleteListing);
router.get('/requests', getRequestsOnMyListings);
router.put('/requests/:id', updateRequestStatus);

module.exports = router;
