// utils/sendEmail.js
const nodemailer = require('nodemailer');
const NewUser = require('../models/newUser');
const moment = require('moment');
const NewLeads = require('../models/leadsModel');
const OtherUser = require('../models/otherUser');

function generateOTP(length) {
    const charset = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        otp += charset[randomIndex];
    }
    return otp;
}


const smptTransporter = nodemailer.createTransport({
    host: 'cutedgetechnology.com', // Replace with your SMTP server
    port: 465, // Replace with your SMTP port (465 for SSL, 587 for TLS)
    debug: true,
    secureConnection: false,
    secure: true, // Set to true if using port 465, false for other ports
    auth: {
        user: 'sandeep@cutedgetechnology.com', // Your email address
        pass: 'sandeepverma1998' // Your email password
    },
    tls: {
        rejectUnauthorized: true
    },
});


// Function to send email
const sendVerifyEmail = async (email, name, code) => {

    const mailOptions = {
        to: email, // List of recipients
        subject: 'Verification Code ✔', // Subject line
        html: `<div class="container">
    <div class="content">
        <p>Hi ${name},</p>
        <p>Thank you for signing up at 
        <a href="crmhai.com">crmhai.com</a>
        . Please use the verification code below to verify your email address:</p>
        <div class="verification-code">
          <b> Code :   ${code} </b>
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
        let response = await smptTransporter.sendMail({
            from: `"Crmhai" <sandeep@cutedgetechnology.com>`, // Your email
            ...mailOptions,
        });
        console.log('Email sent successfully');
        return response
    } catch (error) {
        console.error('Error sending email:', error);
        return error
    }
};



const leadRecivedEmail = async (leadDetails) => {
    let findUser = await NewUser.findById(leadDetails?.userId)
    const mailOptions = {
        to: findUser?.email || "", // Admin email to receive the notification
        subject: 'New Lead Received', // Subject line
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333333; text-align: center;">New Lead Notification</h2>
                <p style="color: #555555;">Dear ${findUser?.fullName || ""} ,</p>
                <p style="color: #555555;">  You have received a new lead. Below are the details:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <th style="text-align: left; padding: 8px; background-color: #1a73e8; color: #ffffff;">Field</th>
                        <th style="text-align: left; padding: 8px; background-color: #1a73e8; color: #ffffff;">Details</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Sender Name</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${leadDetails?.senderName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Mobile Number</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${leadDetails?.senderMobileNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Received Time</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${moment(leadDetails?.queryTime).calendar()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Source</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${leadDetails?.leadSource}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Message</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${leadDetails?.subject}</td>
                    </tr>
                </table>
                <p style="color: #555555; margin-top: 20px;">
                    Please follow up with the lead at your earliest convenience.
                </p>
                <p style="color: #555555;">
                    Thank you,<br>
                    <strong>Cut Edge Technology</strong>
                </p>
            </div>
            <div style="text-align: center; color: #999999; margin-top: 20px; font-size: 12px;">
                <p>&copy; 2024 Cut Edge Technology. All rights reserved.</p>
            </div>
        </div>
        `, // HTML body
    };


    if (findUser && findUser?.isEmailEnable.some((vlu)=> vlu.role == "admin" && vlu.isEnable)) {
        try {
            let response = await smptTransporter.sendMail({
                from: `"Crmhai.com" <sandeep@cutedgetechnology.com>`, // Your email
                ...mailOptions,
            });
            console.log('Email sent successfully');
            return response
        } catch (error) {
            console.error('Error sending email:', error);
            return error
        }
    }
};

const leadAssignEmail = async (details) => {
    let leadDetails = await NewLeads.findById(details?.leadId)
    let findUser = await OtherUser.findById(details?.userId)
    let admin = await NewUser.findById(findUser?.companyId)
    // console.log(findUser ,leadDetails);
    const mailOptions = {
        to: findUser?.email || "", // Admin email to receive the notification
        subject: 'New Lead Assign', // Subject line
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333333; text-align: center;">New Lead Notification</h2>
                <p style="color: #555555;">Dear ${findUser?.fullName || ""} ,</p>
                <p style="color: #555555;">  A new lead has been assigned to you! . Below are the details:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <th style="text-align: left; padding: 8px; background-color: #1a73e8; color: #ffffff;">Field</th>
                        <th style="text-align: left; padding: 8px; background-color: #1a73e8; color: #ffffff;">Details</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Sender Name</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${leadDetails?.senderName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Mobile Number</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${leadDetails?.senderMobileNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Received Time</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${moment(leadDetails?.queryTime).calendar()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Source</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${leadDetails?.leadSource}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #dddddd;">Message</td>
                        <td style="padding: 8px; border: 1px solid #dddddd;">${leadDetails?.subject}</td>
                    </tr>
                </table>
                <p style="color: #555555; margin-top: 20px;">
                    Please follow up with the lead at your earliest convenience.
                </p>
                <p style="color: #555555;">
                    Thank you,<br>
                    <strong>Cut Edge Technology</strong>
                </p>
            </div>
            <div style="text-align: center; color: #999999; margin-top: 20px; font-size: 12px;">
                <p>&copy; 2024 Cut Edge Technology. All rights reserved.</p>
            </div>
        </div>
        `, // HTML body
    };


    if (findUser && admin?.isEmailEnable.some((vlu)=> vlu.role == "employee" && vlu.isEnable)) {
        try {
            let response = await smptTransporter.sendMail({
                from: `"Crmhai.com" <sandeep@cutedgetechnology.com>`, // Your email
                ...mailOptions,
            });
            console.log('Email sent successfully');
            return response
        } catch (error) {
            console.error('Error sending email:', error);
            return error
        }

    }
};





module.exports = { sendVerifyEmail, leadAssignEmail, generateOTP, leadRecivedEmail };
