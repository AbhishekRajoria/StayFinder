import express from 'express';
import { getListings, getListing, createListing, updateListing, deleteListing, getMyListings, getListingBookings } from '../controllers/listingController';
import { protect } from '../middleware/authMiddleware';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = express.Router();

// Public routes
router.get('/search', getListings);
router.get('/', getListings);

// Protected routes
router.get('/me', protect, getMyListings);
router.post('/', protect, uploadMiddleware, createListing);
router.get('/:id', getListing);
router.put('/:id', protect, uploadMiddleware, updateListing);
router.delete('/:id', protect, deleteListing);
router.get("/:listingId/bookings", getListingBookings);

export default router; 