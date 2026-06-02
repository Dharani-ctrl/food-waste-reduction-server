const express = require('express');
const router = express.Router();
const { 
  getAdminStats, 
  getAllUsers, 
  updateUserStatus, 
  deleteUser,
  getAllListings,
  updateListingStatus,
  deleteListing
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/listings', getAllListings);
router.put('/listings/:id/status', updateListingStatus);
router.delete('/listings/:id', deleteListing);

module.exports = router;
