const nodemailer = require('nodemailer');

require('dotenv').config();
const gmailUsername = process.env.EMAIL_SENDER_GMAIL_USERNAME;
const gmailPassword = process.env.EMAIL_SENDER_GMAIL_PASSWORD;

// Create a transporter object with SMTP server details
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: gmailUsername,
        pass: gmailPassword,
    },
});

// Send email function
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: 'notification@myadvisor.com',
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = {
    sendEmail,
};
