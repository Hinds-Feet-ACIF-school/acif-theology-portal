// server/routes/utility.routes.js
import express from "express";
import nodemailer from "nodemailer";
// Ensure dotenv is configured in your main app.js/server.js if not already globally.
// import dotenv from 'dotenv';
// dotenv.config(); // Usually done once in the main app file

const router = express.Router();

router.post("/contact-form", async (req, res) => {
    const { name, email, subject, message } = req.body;

    console.log("Backend received /contact-form request with data:", req.body);

    if (!name || !email || !subject || !message) {
        console.log("Backend: Missing fields for contact form.");
        return res.status(400).json({ message: "All fields are required for contact form." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Backend: Invalid email format for contact form.");
      return res.status(400).json({ message: "Invalid email format provided." });
    }
    
    // Configure Nodemailer Transporter using .env variables
    let transporterOptions = {
        host: process.env.EMAIL_HOST, // Should be 'smtp.gmail.com'
        port: parseInt(process.env.EMAIL_PORT || "465"), // Default to 465 if not set
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587 (STARTTLS)
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    };

    // If using port 587, secure should be false and you might need requireTLS: true
    if (transporterOptions.port === 587) {
        transporterOptions.secure = false; // For STARTTLS on port 587
        // transporterOptions.requireTLS = true; // Often needed for 587
    }
    
    console.log("Nodemailer Transporter Options:", {
        host: transporterOptions.host,
        port: transporterOptions.port,
        secure: transporterOptions.secure,
        user: transporterOptions.auth.user ? '******' : 'NOT SET', // Don't log pass
    });


    let transporter = nodemailer.createTransport(transporterOptions);

    // Verify transporter configuration (optional, but good for debugging)
    transporter.verify(function(error, success) {
        if (error) {
            console.error("Nodemailer transporter verification error:", error);
        } else {
            console.log("Nodemailer transporter is ready to take messages (verification success)");
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM_NOREPLY || `"${name}" <${process.env.EMAIL_USER}>`, // Use defined "From" name if available
        to: "miheretgirmachew@gmail.com", 
        replyTo: email, 
        subject: `Contact Form Submission: ${subject}`,
        text: `You have a new message from ${name} (${email}):\n\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: `
            <p>You have received a new message from your website's contact form:</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
                <li><strong>Subject:</strong> ${subject}</li>
            </ul>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
        `,
    };

    try {
        console.log("Backend: Attempting to send contact email with options:", {
            from: mailOptions.from,
            to: mailOptions.to,
            replyTo: mailOptions.replyTo,
            subject: mailOptions.subject,
        });
        let info = await transporter.sendMail(mailOptions);
        console.log("Backend: Contact email sent successfully. Message ID:", info.messageId);
        res.status(200).json({ message: "Message sent successfully! We'll be in touch soon." });
    } catch (error) {
        console.error("Backend: Error sending contact email:", error);
        res.status(500).json({ message: "Failed to send message on server. Please try again later." });
    }
});

export default router;