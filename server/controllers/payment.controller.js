import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import { auth } from "../config/firebase.config.js";
import * as UserModel from "../models/user.model.js";
import * as PendingRegistrationModel from "../models/pendingRegistration.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CHAPA_API_BASE_URL = "https://api.chapa.co/v1";
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const REGISTRATION_FEE_ETB = parseFloat(process.env.REGISTRATION_FEE_AMOUNT || "100");
const CURRENCY_ETB = process.env.REGISTRATION_FEE_CURRENCY || "ETB";

const REGISTRATION_FEE_USD_CENTS = parseInt(process.env.REGISTRATION_FEE_USD_CENTS || "3500", 10);
const CURRENCY_USD = "usd";

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export const initializeRegistrationPayment = async (req, res) => {
    console.log('Request Body:', req.body);
    const {
        firstName, lastName, email, password, country,
        church, selectedCohortId, phoneNumber,
        paymentMethod // The new field from the frontend
    } = req.body;

    // Validate the new paymentMethod field
    if (!paymentMethod || !['chapa', 'stripe'].includes(paymentMethod)) {
        console.error('Missing or invalid payment method');
        return res.status(400).json({ message: "A valid payment method (Chapa or Stripe) must be selected." });
    }
    
    // Validate the other required fields
    if (!firstName || !lastName || !email || !password || !country || !selectedCohortId) {
        console.error('Missing required fields');
        return res.status(400).json({ message: "All fields including cohort selection are required." });
    }

    try {
        let checkout_url;

        // --- Logic is now based on the user's selected paymentMethod ---
        
        if (paymentMethod === 'chapa') {
            console.log(`Initializing payment for ${email} via selected method: Chapa.`);
            const tx_ref = `reg-chapa-${uuidv4()}`;
            
            // --- FULL CHAPA LOGIC ---
            const pendingData = {
                firstName, lastName, email, password, country,
                church: church || null, selectedCohortId, phoneNumber: phoneNumber || null,
                amount: REGISTRATION_FEE_ETB, currency: CURRENCY_ETB,
            };
            await PendingRegistrationModel.createPendingRegistration(tx_ref, pendingData);
            console.log('Pending registration created for Chapa:', tx_ref);

            const chapaPayload = {
                amount: REGISTRATION_FEE_ETB.toString(),
                currency: CURRENCY_ETB,
                email: email,
                first_name: firstName,
                last_name: lastName,
                tx_ref: tx_ref,
                callback_url: `${process.env.CHAPA_CALLBACK_URL}`, // This must be defined in .env
                return_url: `${process.env.CHAPA_RETURN_URL}?tx_ref=${tx_ref}`, // This must be defined in .env
                "customization[title]": "Program Registration Fee",
                "customization[description]": `Payment for cohort: ${selectedCohortId}.`,
            };
            if (phoneNumber) chapaPayload.phone_number = phoneNumber;

            const response = await axios.post(
                `${CHAPA_API_BASE_URL}/transaction/initialize`,
                chapaPayload,
                { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}`, 'Content-Type': 'application/json' } }
            );

            if (response.data?.status !== 'success' || !response.data?.data?.checkout_url) {
                console.error('Chapa payment initialization failed:', response.data);
                await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'init_failed', { chapaResponse: response.data });
                return res.status(400).json({ message: response.data.message || "Chapa payment initialization failed." });
            }
            
            checkout_url = response.data.data.checkout_url;

        } else if (paymentMethod === 'stripe') {
            console.log(`Initializing payment for ${email} via selected method: Stripe.`);

            // --- FULL STRIPE LOGIC ---
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [{
                    price_data: {
                        currency: CURRENCY_USD,
                        product_data: {
                            name: 'Program Registration Fee',
                            description: `Enrollment for cohort: ${selectedCohortId}.`,
                        },
                        unit_amount: REGISTRATION_FEE_USD_CENTS,
                    },
                    quantity: 1,
                }],
                customer_email: email,
                metadata: {
                    firstName, lastName, email, country, selectedCohortId,
                    church: church || 'N/A',
                    phoneNumber: phoneNumber || 'N/A',
                },
                success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/register`,
            });

            checkout_url = session.url;
        }

        res.status(200).json({ checkout_url });

    } catch (error) {
        console.error("Payment Initialization Error:", error.message);
        res.status(500).json({ message: "Server error during payment initialization." });
    }
};

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Stripe Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Stripe checkout.session.completed event received for:', session.id);

        const {
            firstName, lastName, email, country, selectedCohortId, church, phoneNumber
        } = session.metadata;
        
        const temporaryPassword = uuidv4();

        let userRecord;
        try {
            console.log(`Stripe Webhook: Creating user for email: ${email}`);
            
            const existingUser = await UserModel.getUserByEmail(email);
            if (existingUser) {
                console.log(`Stripe Webhook: User with email ${email} already exists. Ignoring fulfillment.`);
                return res.status(200).send("OK. User already processed.");
            }
            
            userRecord = await auth.createUser({
                email,
                password: temporaryPassword,
                displayName: `${firstName} ${lastName}`,
            });
            console.log(`Stripe Webhook: Firebase Auth user ${userRecord.uid} created.`);

            const role = "student";
            await auth.setCustomUserClaims(userRecord.uid, { role });
            console.log(`Stripe Webhook: Custom claims set for user ${userRecord.uid}.`);

            const userDataForFirestore = {
                uid: userRecord.uid,
                email, firstName, lastName, role, country, church, phoneNumber,
                displayName: `${firstName} ${lastName}`,
                enrollment: {
                    cohortId: selectedCohortId,
                    paymentTxRef: session.id,
                    paymentIntentId: session.payment_intent,
                    paymentAmount: session.amount_total / 100,
                    paymentCurrency: session.currency,
                    enrollmentDate: new Date(),
                },
                createdAt: new Date(),
            };
            await UserModel.createUser(userDataForFirestore);
            console.log(`Stripe Webhook: Firestore user document created for UID: ${userRecord.uid}.`);

        } catch (userCreationError) {
            console.error(`Stripe Webhook: User creation failed for email ${email}`, userCreationError);
            if (userRecord?.uid) {
                console.log(`Stripe Webhook: Rolling back Firebase Auth user ${userRecord.uid}.`);
                await auth.deleteUser(userRecord.uid).catch(delErr => console.error("Rollback failed:", delErr));
            }
            return res.status(200).send("OK. Processed with internal error during user creation.");
        }
    }

    res.status(200).send("OK");
};

export const handleChapaWebhook = async (req, res) => {
    console.log(`CHAPA CALLBACK/WEBHOOK: Entry point hit. Method: ${req.method}`);
    console.log('CHAPA CALLBACK/WEBHOOK: Query Params:', JSON.stringify(req.query));
    console.log('CHAPA CALLBACK/WEBHOOK: Body:', JSON.stringify(req.body));

    let tx_ref = req.query.tx_ref || req.query.trx_ref || req.body.tx_ref || req.body.trx_ref;

    console.log(`CHAPA CALLBACK/WEBHOOK: Attempting to process for tx_ref: ${tx_ref}`);

    if (!tx_ref) {
        console.warn("CHAPA CALLBACK/WEBHOOK: tx_ref or trx_ref missing.");
        return res.status(400).send("Transaction reference missing.");
    }

    try {
        const verifyResponse = await axios.get(
            `${CHAPA_API_BASE_URL}/transaction/verify/${tx_ref}`,
            { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } }
        );

        if (verifyResponse.data && verifyResponse.data.status === 'success' && verifyResponse.data.data) {
            const paymentData = verifyResponse.data.data;
            if (paymentData.status === 'success') {
                console.log(`CHAPA CALLBACK/WEBHOOK: Payment success (verified by Chapa API) for tx_ref: ${tx_ref}`);
                const pendingReg = await PendingRegistrationModel.getPendingRegistration(tx_ref);

                if (!pendingReg) {
                    console.error(`CHAPA CALLBACK/WEBHOOK: No pending registration found for verified tx_ref: ${tx_ref}.`);
                    return res.status(404).send("Pending registration not found.");
                }

                if (pendingReg.status === 'completed_user_created') {
                    console.log(`CHAPA CALLBACK/WEBHOOK: User already created for tx_ref: ${tx_ref}. Ignoring duplicate.`);
                    return res.status(200).send("OK. User already processed.");
                }

                await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'payment_confirmed', { chapaPaymentData: paymentData });
                console.log(`CHAPA CALLBACK/WEBHOOK: Pending registration status updated to 'payment_confirmed' for tx_ref: ${tx_ref}`);


                let userRecord;
                try {
                    console.log(`CHAPA CALLBACK/WEBHOOK: Attempting Firebase Auth user creation for email: ${pendingReg.email}, tx_ref: ${tx_ref}`);
                    userRecord = await auth.createUser({
                        email: pendingReg.email,
                        password: pendingReg.password,
                        displayName: `${pendingReg.firstName} ${pendingReg.lastName}`,
                    });
                    console.log(`CHAPA CALLBACK/WEBHOOK: Firebase Auth user ${userRecord.uid} created for tx_ref: ${tx_ref}`);


                    const role = "student";
                    await auth.setCustomUserClaims(userRecord.uid, { role });
                    console.log(`CHAPA CALLBACK/WEBHOOK: Custom claims set for user ${userRecord.uid}, tx_ref: ${tx_ref}`);


                    const userDataForFirestore = {
                        uid: userRecord.uid,
                        email: pendingReg.email,
                        firstName: pendingReg.firstName,
                        lastName: pendingReg.lastName,
                        displayName: `${pendingReg.firstName} ${pendingReg.lastName}`,
                        role: role,
                        country: pendingReg.country,
                        church: pendingReg.church,
                        phoneNumber: pendingReg.phoneNumber,
                        enrollment: {
                            cohortId: pendingReg.selectedCohortId,
                            paymentTxRef: tx_ref,
                            paymentAmount: pendingReg.amount,
                            paymentCurrency: pendingReg.currency,
                            enrollmentDate: new Date()
                        },
                    };
                    console.log(`CHAPA CALLBACK/WEBHOOK: Attempting Firestore user document creation for UID: ${userRecord.uid}, tx_ref: ${tx_ref}`);
                    await UserModel.createUser(userDataForFirestore);
                    console.log(`CHAPA CALLBACK/WEBHOOK: Firestore user document created for UID: ${userRecord.uid}, tx_ref: ${tx_ref}`);


                    await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'completed_user_created', { userId: userRecord.uid });
                    console.log(`CHAPA CALLBACK/WEBHOOK: Pending registration status updated to 'completed_user_created' for tx_ref: ${tx_ref}, UserID: ${userRecord.uid}`);

                } catch (userCreationError) {
                    console.error(`CHAPA CALLBACK/WEBHOOK: User creation failed for tx_ref: ${tx_ref}`, userCreationError);
                    if (userRecord && userRecord.uid) {
                        console.log(`CHAPA CALLBACK/WEBHOOK: Rolling back Firebase Auth user ${userRecord.uid} due to creation error for tx_ref: ${tx_ref}`);
                        try { await auth.deleteUser(userRecord.uid); } catch (delErr) { console.error("CHAPA CALLBACK/WEBHOOK: Failed to rollback Firebase Auth user:", delErr); }
                    }
                    await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'user_creation_failed', { errorDetail: userCreationError.message });
                    return res.status(200).send("OK. Processed with internal error during user creation.");
                }
            } else {
                console.log(`CHAPA CALLBACK/WEBHOOK: Payment NOT successful (verified by Chapa API) for tx_ref: ${tx_ref}. Chapa Status: ${paymentData.status}`);
                await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'payment_failed_chapa_verify', { chapaPaymentData: paymentData });
            }
        } else {
            console.error(`CHAPA CALLBACK/WEBHOOK: Chapa transaction verification API call failed or returned unexpected data for tx_ref: ${tx_ref}. Response:`, verifyResponse.data);
            await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'chapa_verify_failed', { chapaResponse: verifyResponse.data });
        }
    } catch (error) {
        console.error(`CHAPA CALLBACK/WEBHOOK: Webhook Processing Error for tx_ref ${tx_ref}:`, error.response ? error.response.data : error.message, error.stack ? `\nStack: ${error.stack}` : '');
        if (tx_ref) {
            await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'webhook_processing_error', { errorDetail: error.message });
        }
        return res.status(200).send("OK. Webhook processed with an internal server error.");
    }

    console.log(`CHAPA CALLBACK/WEBHOOK: Successfully processed tx_ref: ${tx_ref}.`);
    res.status(200).send("OK. Webhook processed successfully.");
};

export const getRegistrationStatus = async (req, res) => {
    const { tx_ref } = req.query;
    if (!tx_ref) {
        return res.status(400).json({ message: "Transaction reference is required." });
    }
    try {
        const pendingReg = await PendingRegistrationModel.getPendingRegistration(tx_ref);
        if (!pendingReg) {
            return res.status(404).json({ status: 'not_found', message: "Registration attempt not found." });
        }

        if (pendingReg.status === 'completed_user_created' && pendingReg.userId) {
            const user = await UserModel.getUserById(pendingReg.userId);
            if (user) {
                return res.status(200).json({
                    status: 'success',
                    message: "Registration successful!",
                    user: { uid: user.uid, email: user.email, cohortId: user.enrollment?.cohortId }
                });
            } else {
                 console.warn(`User ${pendingReg.userId} not found in Firestore despite pendingReg status.`);
                 await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'data_inconsistency_user_missing');
            }
        }

        let clientStatus = 'pending';
        let clientMessage = 'Your registration is being processed. Payment confirmation pending.';

        if (pendingReg.status === 'payment_confirmed') {
            clientMessage = 'Payment confirmed. Finalizing registration...';
        } else if (pendingReg.status === 'payment_failed_chapa_verify' || pendingReg.status === 'chapa_verify_failed') {
            clientStatus = 'failed';
            clientMessage = 'Payment verification failed. Please contact support if you believe this is an error.';
        } else if (['user_creation_failed', 'webhook_processing_error', 'init_failed', 'init_error', 'data_inconsistency_user_missing'].includes(pendingReg.status)) {
            clientStatus = 'error';
            clientMessage = 'An error occurred during registration. Please contact support.';
        } else if (pendingReg.status === 'completed_user_created' && !pendingReg.userId) {
            clientStatus = 'error';
            clientMessage = 'Registration seems complete but user ID is missing. Please contact support.';
        } else if (pendingReg.status === 'completed_user_created') {
            clientStatus = 'success';
            clientMessage = 'Registration successful!';
        }

        res.status(200).json({
            status: clientStatus,
            message: clientMessage,
            detail_status: pendingReg.status
        });

    } catch (error) {
        console.error("Error getting registration status:", error);
        res.status(500).json({ status: 'error', message: "Error checking registration status." });
    }
};