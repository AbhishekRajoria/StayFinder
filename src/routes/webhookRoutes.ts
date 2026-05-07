import express from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router = express.Router();

// Raw body required!
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
