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

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  categories: { // Changed from 'category' to 'categories' for consistency
    type: [String],
    default: [],
  },
  address: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
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
  location: {
    type: locationSchema,
    required: true,
  }
}, { timestamps: true });

// Index for geospatial queries
shopSchema.index({ location: '2dsphere' });
// Index for text search on name and categories
shopSchema.index({ name: 'text', categories: 'text', description: 'text' });


const Shop = mongoose.model('Shop', shopSchema);

export default Shop; 