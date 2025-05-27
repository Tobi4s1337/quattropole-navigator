import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  },
  coordinates: { // [longitude, latitude]
    type: [Number],
    required: true,
  }
}, { _id: false });

const parkingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  capacity: {
    type: Number,
  },
  address: {
    type: String,
    trim: true,
  },
  openingHours: { // Changed from 'opening_hours' to 'openingHours'
    type: mongoose.Schema.Types.Mixed,
    default: null, // Can be null as per example
  },
  email: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  imageUrls: { // Added for consistency, though not in example
    type: [String],
    default: [],
  },
  location: {
    type: locationSchema,
    required: true,
  }
}, { timestamps: true });

// Index for geospatial queries
parkingSchema.index({ location: '2dsphere' });
// Index for text search
parkingSchema.index({ name: 'text', address: 'text' });

const Parking = mongoose.model('Parking', parkingSchema);

export default Parking; 