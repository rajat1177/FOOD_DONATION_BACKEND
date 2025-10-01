import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendDonationSuccessEmail = async (email, donationDetails) => {
    try {
        const { title, quantity, category, locationAddress } = donationDetails;

        // Configure the transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank You for Your Donation!',
            text: `Dear Donor,

Thank you for your generous donation! Here are the details of your contribution:

- **Item Title:** ${title}
- **Quantity:** ${quantity}
- **Category:** ${category}
- **Pickup Location:** ${locationAddress}

Your support helps us make a real difference in our community. We truly appreciate your kindness and generosity.

Warm regards,  
[Your Organization Name]`,
            html: `<p>Dear Donor,</p>
<p>Thank you for your generous donation! Here are the details of your contribution:</p>
<ul>
    <li><strong>Item Title:</strong> ${title}</li>
    <li><strong>Quantity:</strong> ${quantity}</li>
    <li><strong>Category:</strong> ${category}</li>
    <li><strong>Pickup Location:</strong> ${locationAddress}</li>
</ul>
<p>Your support helps us make a real difference in our community. We truly appreciate your kindness and generosity.</p>
<p>Warm regards,<br>[Your Organization Name]</p>`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Donation success email sent to:', email);
    } catch (error) {
        
        console.error('Error sending donation success email:', error);
        throw new Error('Failed to send donation success email');
    }
};
