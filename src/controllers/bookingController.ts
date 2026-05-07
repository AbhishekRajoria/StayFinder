import { Response } from 'express';
import Booking from '../models/Booking';
import Listing from '../models/Listing';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';

interface PopulatedListing {
  _id: Types.ObjectId;
  host: Types.ObjectId;
}

const ensureUser = (req: AuthRequest) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  const { listing, startDate, endDate, guests } = req.body;

  try {
    const user = ensureUser(req);
    const listingDoc = await Listing.findById(listing);
    if (!listingDoc) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Validate number of guests
    if (guests > listingDoc.guests) {
      return res.status(400).json({ 
        message: `This listing can only accommodate ${listingDoc.guests} guests` 
      });
    }

    if (guests < 1) {
      return res.status(400).json({ message: 'Number of guests must be at least 1' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listingDoc.price;

    const overlapping = await Booking.findOne({
      listing,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startDate: { $lt: end },
          endDate: { $gt: start },
        }
      ]
    });
    
    if (overlapping) {
      return res.status(400).json({ message: 'This listing is already booked for selected dates' });
    }


    const booking = new Booking({
      listing: new Types.ObjectId(listing),
      user: new Types.ObjectId(user.id),
      startDate: start,
      endDate: end,
      totalPrice,
      nights,
      guests
    });

    await booking.save();
    return res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.status(500).json({ message: 'Error creating booking', error });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    
    const user = ensureUser(req);
    const bookings = await Booking.find({ user: user.id })
      .populate('listing')
      .sort({ createdAt: -1 });
      
    return res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const user = ensureUser(req);
    const booking = await Booking.findById(req.params.id).populate('listing');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isGuest = booking.user.toString() === user.id;
    const isHost = (booking.listing as any).host.toString() === user.id;

    if (!isGuest && !isHost) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = new Types.ObjectId(user.id);

    await booking.save();

    return res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.status(500).json({ message: 'Error cancelling booking', error });
  }
};


export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = ensureUser(req);
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate<{ listing: PopulatedListing }>({
        path: 'listing',
        select: 'host'
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the host of the listing
    if (booking.listing.host.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update booking status' });
    }

    // Validate status transition
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update status of a cancelled booking' });
    }

    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancelledBy = new Types.ObjectId(user.id);
    }

    booking.status = status;
    await booking.save();

    return res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    if (error instanceof Error && error.message === 'User not authenticated') {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.status(500).json({ message: 'Error updating booking status', error });
  }
}; 


export const getHostBookings = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Only hosts or admins can fetch host bookings
    if (user.role !== 'host' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find all listings created by this host
    const listings = await Listing.find({ host: user.id }, { _id: 1 });
    const listingIds = listings.map((listing) => listing._id);

    // Find all bookings related to these listings
    const bookings = await Booking.find({ listing: { $in: listingIds } })
      .populate('listing')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Wrap bookings in an object
    return res.json({ bookings });
  } catch (error) {
    console.error('Error fetching host bookings:', error);
    return res.status(500).json({ message: 'Error fetching host bookings' });
  }
};



export const getListingBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({ message: "Listing ID is required" });
    }

    const bookings = await Booking.find({
      listing: listingId,
      status: { $ne: "cancelled" },
    }).select("startDate endDate"); // Only return needed fields

    return res.json(bookings);
  } catch (error) {
    console.error("Error fetching listing bookings:", error);
    return res.status(500).json({ message: "Failed to fetch listing bookings" });
  }
};
