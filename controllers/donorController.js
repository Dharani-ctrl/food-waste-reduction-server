const FoodListing = require('../models/FoodListing');
const PickupRequest = require('../models/PickupRequest');
const { getIO } = require('../utils/socket');
const { sendMail } = require('../utils/mailer');
const User = require('../models/User');

// @desc    Create a new food listing
// @route   POST /api/donor/food
// @access  Private/Donor
const createListing = async (req, res) => {
  try {
    const {
      title, description, category, quantity, unit, 
      expiryDateTime, listingType, price, pickupAddress, city, location, images
    } = req.body;

    const listing = await FoodListing.create({
      donorId: req.user._id,
      title,
      description,
      category,
      quantity,
      unit,
      expiryDateTime,
      listingType: listingType || 'donation',
      price: listingType === 'low-cost' ? price : 0,
      pickupAddress: pickupAddress || req.user.address,
      city: city || req.user.city,
      location,
      images: images || [],
      status: 'active'
    });

    // Notify all NGOs
    try {
      getIO().to('ngo_room').emit('new_food', {
        title: listing.title,
        city: listing.city,
        quantity: listing.quantity,
        unit: listing.unit
      });
    } catch(e) { console.error("Socket err", e); }

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get donor's own listings
// @route   GET /api/donor/my-listings
// @access  Private/Donor
const getMyListings = async (req, res) => {
  try {
    const listings = await FoodListing.find({ donorId: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a food listing
// @route   PUT /api/donor/food/:id
// @access  Private/Donor
const updateListing = async (req, res) => {
  try {
    let listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Make sure user owns the listing
    if (listing.donorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    listing = await FoodListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a food listing
// @route   DELETE /api/donor/food/:id
// @access  Private/Donor
const deleteListing = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.donorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get pickup requests for donor's listings
// @route   GET /api/donor/requests
// @access  Private/Donor
const getRequestsOnMyListings = async (req, res) => {
  try {
    const requests = await PickupRequest.find({ donorId: req.user._id })
      .populate('ngoId', 'name email phone ngoRegNumber')
      .populate('listingId', 'title category quantity unit')
      .sort({ requestedAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update pickup request status (Accept/Decline)
// @route   PUT /api/donor/requests/:id
// @access  Private/Donor
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pickupRequest = await PickupRequest.findById(req.params.id);

    if (!pickupRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (pickupRequest.donorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    pickupRequest.status = status;
    await pickupRequest.save();

    if (status === 'cancelled') {
      await FoodListing.findByIdAndUpdate(pickupRequest.listingId, { status: 'active' });
    } else if (status === 'confirmed') {
      // Notify NGO
      try {
        const ngoUser = await User.findById(pickupRequest.ngoId);
        const food = await FoodListing.findById(pickupRequest.listingId);
        if (ngoUser) {
          getIO().to(ngoUser._id.toString()).emit('donation_accepted', {
            title: 'Pickup Confirmed',
            message: `${req.user.name} has confirmed your pickup request for ${food.title}.`
          });
          
          const ngoHtml = `
            <h2>Pickup Request Confirmed!</h2>
            <p><strong>${req.user.name}</strong> has accepted your request for:</p>
            <div style="background:#f9fafb; padding:15px; border-radius:8px; margin: 15px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin-top:0; color:#16a34a;">${food.title}</h3>
              <p><strong>Quantity:</strong> ${food.quantity} ${food.unit}</p>
              <p><strong>Category:</strong> ${food.category}</p>
            </div>
            <h3>Pickup Details</h3>
            <p><strong>Address:</strong> ${req.user.address}</p>
            <p><strong>City:</strong> ${req.user.city}</p>
            <p><strong>Donor Contact:</strong> ${req.user.phone}</p>
            <br/>
            <p>Please arrange for pickup before the food expires.</p>
          `;

          await sendMail(
            ngoUser.email, 
            'Pickup Confirmed - ZeroWaste', 
            `${req.user.name} has confirmed your pickup request for ${food.title}. Please collect it from: ${req.user.address}`,
            ngoHtml
          );

          const donorHtml = `
            <h2>You Accepted a Pickup Request!</h2>
            <p>You have successfully confirmed the pickup for <strong>${food.title}</strong>.</p>
            <div style="background:#f9fafb; padding:15px; border-radius:8px; margin: 15px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin-top:0; color:#2563eb;">NGO Details</h3>
              <p><strong>Name:</strong> ${ngoUser.name}</p>
              <p><strong>Reg Number:</strong> ${ngoUser.ngoRegNumber}</p>
              <p><strong>Contact:</strong> ${ngoUser.phone}</p>
              <p><strong>Email:</strong> ${ngoUser.email}</p>
            </div>
            <p>They will contact you soon to arrange the pickup.</p>
          `;

          await sendMail(
            req.user.email,
            'You Confirmed a Pickup - ZeroWaste',
            `You accepted a request from ${ngoUser.name}.`,
            donorHtml
          );
        }
      } catch(e) { console.error("Notification err", e); }
    }

    res.json(pickupRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  getRequestsOnMyListings,
  updateRequestStatus
};
