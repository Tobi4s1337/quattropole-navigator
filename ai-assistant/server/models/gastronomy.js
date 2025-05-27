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
}, { _id: false });

const gastronomySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  categories: {
    type: [String],
    default: [],
  },
  address: {
    type: String,
    trim: true,
  },
  contactDetails: contactDetailsSchema,
  openingHours: { // Changed from 'opening_hours' to 'openingHours'
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  website: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrls: { // Changed from 'images' to 'imageUrls'
    type: [String],
    default: [],
  },
  diets: {
    type: [String],
    default: [],
  },
  cuisines: {
    type: [String],
    default: [],
  },
  features: {
    type: [String],
    default: [],
  },
  paymentMethods: { // Changed from 'payment_methods' to 'paymentMethods'
    type: [String],
    default: [],
  },
  location: {
    type: locationSchema,
    required: true,
  }
}, { timestamps: true });

// Index for geospatial queries
gastronomySchema.index({ location: '2dsphere' });
// Index for text search and filtering
gastronomySchema.index({ name: 'text', categories: 'text', description: 'text', diets: 1, cuisines: 1 });

const Gastronomy = mongoose.model('Gastronomy', gastronomySchema);

export default Gastronomy; 