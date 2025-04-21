const { Resend } = require("resend");

const resend = new Resend(process.env.SEND_EMAIL_API_KEY);

const sendNotificationEmail = async (toAddress, fromUserName) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'no-reply@bondly.in',
            to: toAddress,
            subject: 'Action Required: Your Pending Connection',
            html: `
                <p>Hello,</p>
                <p><strong>${fromUserName}</strong> has shown interest in connecting with you.</p>
                <p>Please log in to your account to respond.</p>
            `,
        });

        if (error) {
            console.error(`❌ Error sending email to ${toAddress}:`, error);
        } else {
            console.log(`✅ Notification sent to ${toAddress}`);
        }
    } catch (err) {
        console.error(`❌ Unexpected error sending to ${toAddress}:`, err);
    }
};

module.exports = sendNotificationEmail;
