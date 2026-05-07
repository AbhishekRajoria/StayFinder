import { Request, Response } from 'express';
import Stripe from 'stripe';
import Booking from '../models/Booking';
import { env } from '../config/env';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      console.error('❌ Booking not found:', bookingId);
      return res.status(404).json({ message: 'Booking not found' });
    }

    // check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      console.log('❌ Booking already paid:', bookingId);
      return res.status(400).json({ message: 'Booking already paid' });
    }

    const listing = booking.listing as any;
    console.log('🏠 Creating session for listing:', listing.title);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Stay at ${listing.title}`,
              description: `${booking.nights} nights · ${booking.guests} guests`,
            },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${env.CLIENT_URL}/bookings?success=true&booking_id=${bookingId}`,
      cancel_url: `${env.CLIENT_URL}/bookings?canceled=true&booking_id=${bookingId}`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    console.log('✅ Checkout session created:', {
      sessionId: session.id,
      bookingId: session.metadata?.bookingId,
      amount: session.amount_total,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    return res.status(500).json({ message: 'Failed to create checkout session' });
  }
};
