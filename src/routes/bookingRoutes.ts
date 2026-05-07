import express from 'express';
import { createBooking, getUserBookings, cancelBooking, updateBookingStatus, getHostBookings, getListingBookings } from '../controllers/bookingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/me', protect, getUserBookings);
router.put('/:id/cancel', protect, cancelBooking);
router.patch('/:id/status', protect, updateBookingStatus);
router.get('/host', protect, getHostBookings);
router.get('/listing/:listingId', protect,getListingBookings);

export default router; 