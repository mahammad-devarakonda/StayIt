const nodemailer=require("nodemailer")

const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: "devarakondahuzefa01@gmail.com", pass: "rhmypyupvdyvriqp" }
        });

        const mailOptions = {
            from: "devarakondahuzefa01@gmail.com",
            to: email,
            subject: 'StayIt OTP verification',
            html: `<div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Email Verification</h2>
            <p>Please use the OTP below to complete your verification:</p>
            <h1 style="color: #4CAF50;">${otp}</h1>
            <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Thank you!</p>
          </div>`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
}

module.exports=sendOTPEmail