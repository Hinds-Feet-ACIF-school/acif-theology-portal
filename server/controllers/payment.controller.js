// server/controllers/payment.controller.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { auth } from "../config/firebase.config.js";
import * as UserModel from "../models/user.model.js";
import * as PendingRegistrationModel from "../models/pendingRegistration.model.js";

const CHAPA_API_BASE_URL = "https://api.chapa.co/v1";
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const REGISTRATION_FEE = parseFloat(process.env.REGISTRATION_FEE_AMOUNT || "100");
const CURRENCY = process.env.REGISTRATION_FEE_CURRENCY || "ETB";

console.log('Environment Variables:', {
  CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY,
  CHAPA_CALLBACK_URL: process.env.CHAPA_CALLBACK_URL,
  CHAPA_RETURN_URL: process.env.CHAPA_RETURN_URL,
  REGISTRATION_FEE_AMOUNT: process.env.REGISTRATION_FEE_AMOUNT,
  REGISTRATION_FEE_CURRENCY: process.env.REGISTRATION_FEE_CURRENCY,
});

export const initializeRegistrationPayment = async (req, res) => {
    console.log('Request Body:', req.body);

    const {
        firstName,
        lastName,
        email,
        password,
        country,
        church,
        selectedCohortId,
        phoneNumber
    } = req.body;

    if (!firstName || !lastName || !email || !password || !country || !selectedCohortId) {
        console.error('Missing required fields');
        return res.status(400).json({ message: "All fields including cohort selection are required." });
    }

    console.log('All required fields are present.');

    const tx_ref = `reg-${uuidv4()}`;
    console.log('Generated Transaction Reference:', tx_ref);

    try {
        const pendingData = {
            firstName, lastName, email, password,
            country, church: church || null, selectedCohortId,
            amount: REGISTRATION_FEE, currency: CURRENCY,
            phoneNumber: phoneNumber || null
        };
        console.log('Pending Registration Data:', pendingData);

        await PendingRegistrationModel.createPendingRegistration(tx_ref, pendingData);
        console.log('Pending registration created successfully.');

        const chapaPayload = {
            amount: REGISTRATION_FEE.toString(),
            currency: CURRENCY,
            email: email,
            first_name: firstName,
            last_name: lastName,
            tx_ref: tx_ref,
            callback_url: `${process.env.CHAPA_CALLBACK_URL}`,
            return_url: `${process.env.CHAPA_RETURN_URL}?tx_ref=${tx_ref}`,
            "customization[title]": "Program Registration Fee",
            "customization[description]": `Payment for ${selectedCohortId} intake.`,
        };

        if (phoneNumber) {
            chapaPayload.phone_number = phoneNumber;
        }
        console.log('Chapa Payload:', chapaPayload);

        const response = await axios.post(
            `${CHAPA_API_BASE_URL}/transaction/initialize`,
            chapaPayload,
            { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}`, 'Content-Type': 'application/json' } }
        );

        console.log('Chapa API Response:', response.data);

        if (response.data && response.data.status === 'success' && response.data.data && response.data.data.checkout_url) {
            res.status(200).json({ checkout_url: response.data.data.checkout_url });
        } else {
            console.error('Chapa payment initialization failed:', response.data);
            await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'init_failed', { chapaResponse: response.data });
            res.status(400).json({ message: response.data.message || "Chapa payment initialization failed." });
        }
    } catch (error) {
        console.error("Payment Initialization Error:", error.response ? error.response.data : error.message);
        if (tx_ref) {
            await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'init_error', { errorDetail: error.message });
        }
        res.status(500).json({ message: "Server error during payment initialization." });
    }
};

export const handleChapaWebhook = async (req, res) => {
    // --- Enhanced Logging at the beginning ---
    console.log(`CHAPA CALLBACK/WEBHOOK: Entry point hit. Method: ${req.method}`);
    console.log('CHAPA CALLBACK/WEBHOOK: Query Params:', JSON.stringify(req.query));
    console.log('CHAPA CALLBACK/WEBHOOK: Body:', JSON.stringify(req.body));

    let tx_ref = req.query.tx_ref || req.query.trx_ref || req.body.tx_ref || req.body.trx_ref;

    console.log(`CHAPA CALLBACK/WEBHOOK: Attempting to process for tx_ref: ${tx_ref}`);

    if (!tx_ref) {
        console.warn("CHAPA CALLBACK/WEBHOOK: tx_ref or trx_ref missing.");
        return res.status(400).send("Transaction reference missing.");
    }
    // --- End of enhanced logging ---

    // --- Your existing logic starts here ---
    // The console.log lines below were part of your original code and are fine to keep,
    // though they are somewhat redundant with the new ones above. You can choose to keep or remove them.
    // console.log('Chapa Webhook/Callback Received:'); // Redundant with new logs
    // console.log('Method:', req.method); // Redundant
    // console.log('Query:', JSON.stringify(req.query)); // Redundant
    // console.log('Body:', JSON.stringify(req.body)); // Redundant

    // if (!tx_ref) { // This check is already done above
    //     console.warn("Chapa Webhook/Callback: tx_ref or trx_ref missing.");
    //     return res.status(400).send("Transaction reference missing.");
    // }

    // console.log(`Chapa Webhook/Callback processing for tx_ref: ${tx_ref}`); // Redundant

    try {
        const verifyResponse = await axios.get(
            `${CHAPA_API_BASE_URL}/transaction/verify/${tx_ref}`,
            { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } }
        );

        if (verifyResponse.data && verifyResponse.data.status === 'success' && verifyResponse.data.data) {
            const paymentData = verifyResponse.data.data;
            if (paymentData.status === 'success') {
                console.log(`CHAPA CALLBACK/WEBHOOK: Payment success (verified by Chapa API) for tx_ref: ${tx_ref}`); // Added context
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
                        password: pendingReg.password, // Ensure this password is secure and meets Firebase requirements
                        displayName: `${pendingReg.firstName} ${pendingReg.lastName}`,
                    });
                    console.log(`CHAPA CALLBACK/WEBHOOK: Firebase Auth user ${userRecord.uid} created for tx_ref: ${tx_ref}`);


                    const role = "student"; // Or from pendingReg if applicable
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
                            enrollmentDate: new Date() // Consider FieldValue.serverTimestamp() if consistency across servers is critical
                        },
                        // It's good practice to also add createdAt/updatedAt timestamps here
                        // createdAt: FieldValue.serverTimestamp(),
                        // updatedAt: FieldValue.serverTimestamp(),
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
                    // Still send 200 OK to Chapa as per best practice for webhooks, even if our internal processing had an issue.
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
        // Log the full error object for better diagnostics, especially for network errors from axios
        console.error(`CHAPA CALLBACK/WEBHOOK: Webhook Processing Error for tx_ref ${tx_ref}:`, error.response ? error.response.data : error.message, error.stack ? `\nStack: ${error.stack}` : '');
        if (tx_ref) { // Ensure tx_ref is valid before trying to update status
            await PendingRegistrationModel.updatePendingRegistrationStatus(tx_ref, 'webhook_processing_error', { errorDetail: error.message });
        }
        // Still send 200 OK to Chapa.
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
            // This case should ideally not happen if userId is always set upon successful creation.
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