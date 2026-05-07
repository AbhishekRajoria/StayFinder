import { Request, Response } from 'express';
import Stripe from 'stripe';
import Booking from '../models/Booking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Need raw body here — not parsed JSON
export const handleStripeWebhook = async (req: Request, res: Response) => {
  console.log('🔔 Webhook received');
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  console.log('📦 Processing event:', event.type);

  // Handle successful checkout session
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('💰 Payment successful for session:', session.id);

    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      try {
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { 
            status: 'confirmed',
            paymentStatus: 'paid' 
          },
          { new: true }
        );
        console.log(`✅ Booking ${bookingId} updated:`, {
          status: updatedBooking?.status,
          paymentStatus: updatedBooking?.paymentStatus
        });
      } catch (err) {
        console.error(`❌ Failed to update booking ${bookingId}:`, err);
      }
    } else {
      console.error('❌ No bookingId found in session metadata');
    }
  }

  // Handle expired or failed checkout sessions
  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('❌ Payment failed for session:', session.id);

    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      try {
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { 
            status: 'cancelled',
            paymentStatus: 'unpaid' 
          },
          { new: true }
        );
        console.log(`✅ Booking ${bookingId} cancelled:`, {
          status: updatedBooking?.status,
          paymentStatus: updatedBooking?.paymentStatus
        });
      } catch (err) {
        console.error(`❌ Failed to update booking ${bookingId}:`, err);
      }
    } else {
      console.error('❌ No bookingId found in session metadata');
    }
  }

  return res.status(200).json({ received: true });
};
