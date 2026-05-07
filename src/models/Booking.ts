import mongoose, { Types } from 'mongoose';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
type PaymentStatus = 'unpaid' | 'paid';

const bookingSchema = new mongoose.Schema({
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  nights: { 
    type: Number, 
    required: true 
  },
  guests: { 
    type: Number, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Add type safety for virtuals and methods
export interface IBooking extends mongoose.Document {
  listing: Types.ObjectId;
  user: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  nights: number;
  guests: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  cancelledAt: Date | null;
  cancelledBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking; 