const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'beverages'],
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ['kg', 'servings', 'items'],
      required: true,
    },
    expiryDateTime: {
      type: Date,
      required: true,
    },
    listingType: {
      type: String,
      enum: ['donation', 'low-cost'],
      default: 'donation',
    },
    price: {
      type: Number,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    status: {
      type: String,
      enum: ['active', 'requested', 'completed', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const FoodListing = mongoose.model('FoodListing', foodListingSchema);
module.exports = FoodListing;
