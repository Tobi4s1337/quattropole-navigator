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

const contactDetailsSchema = new mongoose.Schema({
  phone: String,
  email: String,
  webContactForm: Boolean,
}, { _id: false });

const sightseeingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  categories: { // Changed from 'category' to 'categories'
    type: [String],
    default: [],
  },
  contactDetails: contactDetailsSchema,
  address: {
    type: String,
    trim: true,
  },
  openingHours: { // Changed from 'opening_hours' to 'openingHours'
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  websites: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrls: { // Changed from 'images' to 'imageUrls'
    type: [String],
    default: [],
  },
  location: {
    type: locationSchema,
    required: true,
  }
}, { timestamps: true });

// Index for geospatial queries
sightseeingSchema.index({ location: '2dsphere' });
// Index for text search
sightseeingSchema.index({ name: 'text', categories: 'text', description: 'text' });

const Sightseeing = mongoose.model('Sightseeing', sightseeingSchema);

export default Sightseeing; 