const FoodListing = require('../models/FoodListing');
const PickupRequest = require('../models/PickupRequest');
const { getIO } = require('../utils/socket');
const { sendMail } = require('../utils/mailer');
const User = require('../models/User');

// @desc    Browse available food listings
// @route   GET /api/ngo/listings
// @access  Private/NGO
const getAvailableListings = async (req, res) => {
  try {
    const { city, category, listingType } = req.query;
    
    // Build query
    const query = { status: 'active' };
    
    if (city) query.city = { $regex: city, $options: 'i' };
    if (category && category !== 'all') query.category = category;
    if (listingType && listingType !== 'all') query.listingType = listingType;

    const listings = await FoodListing.find(query)
      .populate('donorId', 'name phone address')
      .sort({ createdAt: -1 });
      
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Request pickup for a listing
// @route   POST /api/ngo/request/:listingId
// @access  Private/NGO
const requestPickup = async (req, res) => {
  try {
    const listingId = req.params.listingId;
    const listing = await FoodListing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'This listing is no longer available' });
    }

    // Check if request already exists
    const existingRequest = await PickupRequest.findOne({
      listingId,
      ngoId: req.user._id
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested this listing' });
    }

    // Create request
    const pickupRequest = await PickupRequest.create({
      listingId,
      ngoId: req.user._id,
      donorId: listing.donorId,
      status: 'requested',
      notes: req.body.notes || ''
    });

    // Update listing status to requested
    listing.status = 'requested';
    await listing.save();

    res.status(201).json(pickupRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get my pickup requests
// @route   GET /api/ngo/my-requests
// @access  Private/NGO
const getMyRequests = async (req, res) => {
  try {
    const requests = await PickupRequest.find({ ngoId: req.user._id })
      .populate('donorId', 'name phone address city')
      .populate('listingId', 'title category quantity unit images expiryDateTime listingType price pickupAddress city')
      .sort({ requestedAt: -1 });
      
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/ngo/request/:id
// @access  Private/NGO
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pickupRequest = await PickupRequest.findById(req.params.id);

    if (!pickupRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (pickupRequest.ngoId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    pickupRequest.status = status;
    await pickupRequest.save();

    // If status is picked_up, update listing to completed
    if (status === 'picked_up') {
      await FoodListing.findByIdAndUpdate(pickupRequest.listingId, { status: 'completed' });
      
      try {
        const donorUser = await User.findById(pickupRequest.donorId);
        const food = await FoodListing.findById(pickupRequest.listingId);
        if (donorUser) {
          getIO().to(donorUser._id.toString()).emit('delivery_completed', {
            title: 'Delivery Completed',
            message: `${req.user.name} has picked up ${food.title}. Thank you for donating!`
          });
          
          await sendMail(
            donorUser.email,
            'Donation Picked Up - ZeroWaste',
            `${req.user.name} has successfully picked up your donation: ${food.title}. Thank you for your contribution!`
          );
        }
      } catch (e) { console.error("Notification err", e); }
      
    } else if (status === 'cancelled') {
      await FoodListing.findByIdAndUpdate(pickupRequest.listingId, { status: 'active' });
    }

    res.json(pickupRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAvailableListings,
  requestPickup,
  getMyRequests,
  updateRequestStatus
};
