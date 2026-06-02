const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const PickupRequest = require('../models/PickupRequest');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const activeDonations = await FoodListing.countDocuments({ status: 'active' });
    const completedDonations = await FoodListing.countDocuments({ status: 'completed' });
    
    res.json({
      totalUsers,
      totalNGOs,
      activeDonations,
      completedDonations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user status (block/unblock)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all food listings
// @route   GET /api/admin/listings
// @access  Private/Admin
const getAllListings = async (req, res) => {
  try {
    const listings = await FoodListing.find()
      .populate('donorId', 'name')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update listing status
// @route   PUT /api/admin/listings/:id/status
// @access  Private/Admin
const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('donorId', 'name');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/admin/listings/:id
// @access  Private/Admin
const deleteListing = async (req, res) => {
  try {
    const listing = await FoodListing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json({ message: 'Listing removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllListings,
  updateListingStatus,
  deleteListing
};
