const nodemailer=require("nodemailer")

const sendNotifiacationEmail = async (email) => {
    if (!email) {
        console.error("❌ No recipient email provided!");
        return;
    }

    console.log("Preparing to send email to:", email);
    
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: "devarakondahuzefa01@gmail.com", pass: "rhmypyupvdyvriqp" }
        });

        const mailOptions = {
            from: "devarakondahuzefa01@gmail.com",
            to: email,
            subject: 'Pending Connection Request',
            html: `<div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Pending Connection Request</h2>
            <h2>Hurray new Connection Requests</h2>
            <p>Please login to portal and review requests</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Thank you!</p>
          </div>`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
}

module.exports=sendNotifiacationEmail