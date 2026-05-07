import mongoose from 'mongoose';

type PropertyType = 'house' | 'apartment' | 'villa' | 'condo' | 'studio';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  images: [{
    type: String
  }],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'Must have at least 1 guest']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [1, 'Must have at least 1 bedroom']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: [1, 'Must have at least 1 bathroom']
  },
  amenities: [{
    type: String
  }],
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: {
      values: ['house', 'apartment', 'villa', 'condo', 'studio'] as PropertyType[],
      message: '{VALUE} is not a valid property type'
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware to convert propertyType to lowercase
listingSchema.pre('save', function(next) {
  if (this.propertyType) {
    this.propertyType = this.propertyType.toLowerCase() as PropertyType;
  }
  next();
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing; 