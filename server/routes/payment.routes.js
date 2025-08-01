// server/routes/payment.routes.js

import express from 'express';
import {
    initializeRegistrationPayment,
    handleChapaWebhook,
    getRegistrationStatus,
    handleStripeWebhook
} from '../controllers/payment.controller.js';

const router = express.Router();

// Route for initializing payment. Since this router is now loaded before the
// global express.json(), we add the middleware here specifically.
router.post('/initialize-registration', express.json(), initializeRegistrationPayment);

// Route for the Chapa webhook/callback.
router.route('/chapa-webhook')
  .get(handleChapaWebhook)
  .post(express.json(), handleChapaWebhook); // The POST needs a JSON parser.

// Route for checking registration status.
router.get('/registration-status', getRegistrationStatus);

// Route for the Stripe webhook.
// This route MUST use express.raw() and is the reason for the new file structure.
router.post(
    '/stripe-webhook',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook
);

export default router;