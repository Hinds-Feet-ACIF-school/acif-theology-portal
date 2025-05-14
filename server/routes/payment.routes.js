import express from 'express';
import { initializeRegistrationPayment, handleChapaWebhook, getRegistrationStatus } from '../controllers/payment.controller.js';

const router = express.Router();

// Route to initialize registration payment
router.post('/initialize-registration', initializeRegistrationPayment);

// NEW (in server/routes/payment.routes.js)
router.route('/chapa-webhook')
  .get(handleChapaWebhook)  // Add this line to handle GET requests
  .post(handleChapaWebhook); // Keep this for existing POST handling (if any)

// Route to get registration status
router.get('/registration-status', getRegistrationStatus);

export default router;