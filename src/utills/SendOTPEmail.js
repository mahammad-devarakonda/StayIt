const {Resend} = require("resend")

const resend = new Resend(process.env.SEND_EMAIL_API_KEY);

 const sendOtpMail=async(to, otp)=> {
    try {
        const { data, error } = await resend.emails.send({
            from: 'no-reply@bondly.in',
            to,
            subject: 'Your OTP Code',
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 40px; display: flex; justify-content: center;">
                <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; max-width: 400px; width: 100%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); text-align: center;">
                <h2 style="color: #333;">Email Verification</h2>
                <p style="font-size: 16px; color: #555;">Please use the OTP below to complete your verification:</p>
                <div style="margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 2px;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #888;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #aaa;">If you didn't request this, please ignore this email.</p>
            <p style="font-size: 14px; color: #333; margin-top: 20px;">Thank you!</p>
        </div>
        </div>

            `,
        });

        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('OTP email sent successfully!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}


module.exports = {sendOtpMail}