// utils/sendEmail.js
const nodemailer = require('nodemailer');

function generateOTP(length) {
    const charset = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        otp += charset[randomIndex];
    }
    return otp;
}

// Configure your email transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider, e.g., 'gmail',
    port: 465,
    secure: true,
    //   logger:true,
    debug: true,
    secureConnection: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,// Replace with your email password or an app password
    },
    tls: {
        rejectUnauthorized: true
    }
});


// Function to send email
const sendVerifyEmail = async (email ,name ,code) => {

    const mailOptions = {
        to: email, // List of recipients
        subject: 'Verification Code ✔', // Subject line
        // text: `Your verification code is:3456 `, // Plain text body
        html: `<div class="container">
    <div class="content">
        <p>Hi ${name},</p>
        <p>Thank you for signing up at 
        <a href="crmhai.com">crmhai.com</a>
        . Please use the verification code below to verify your email address:</p>
        <div class="verification-code">
          <b> Code :   ${ code} </b>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you,<br>Cut Edge Technology</p>
    </div>
    <div class="footer">
        <p>&copy; 2024 Your Cut edge Technology. All rights reserved.</p>
    </div>
</div>`, // HTML body
    };


    try {
        let response = await transporter.sendMail({
            from: 'raossachin37@gmail.com', // Your email
            ...mailOptions,
        });

        console.log('Email sent successfully', response);
        return response
    } catch (error) {
        console.error('Error sending email:', error);
        return error
    }
};

module.exports = { sendVerifyEmail, generateOTP };
