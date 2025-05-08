const { Resend } = require("resend");

const resend = new Resend(process.env.SEND_EMAIL_API_KEY);

const sendNotificationEmail = async (toAddress, fromUserName,toUserName) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'no-reply@bondly.in',
            to: toAddress,
            subject: 'Action Required: Your Pending Connection',
            html: `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f9;
                                margin: 0;
                                padding: 0;
                            }
                            .email-container {
                                width: 90%;
                                padding: 20px;
                                background-color: #f4f4f9;
                            }
                            .email-card {
                                max-width: 600px;
                                margin: 0 auto;
                                background-color: #ffffff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            }
                            .email-header {
                                text-align: center;
                                padding-bottom: 20px;
                            }
                            .email-header h2 {
                                color: #333;
                            }
                            .email-body {
                                font-size: 16px;
                                color: #555;
                                line-height: 1.6;
                            }
                            .email-footer {
                                margin-top: 30px;
                                text-align: center;
                                font-size: 14px;
                                color: #888;
                            }
                            .button {
                                display: inline-block;
                                background-color: #007bff;
                                color: #fff;
                                padding: 12px 20px;
                                font-size: 16px;
                                text-decoration: none;
                                border-radius: 5px;
                                margin-top: 20px;
                            }
                            .button:hover {
                                background-color: #0056b3;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="email-card">
                                <div class="email-header">
                                    <h2>Action Required: Your Pending Connection</h2>
                                </div>
                                <div class="email-body">
                                    <p>Hello, <strong>${toUserName}</strong></p>
                                    <p><strong>${fromUserName}</strong> has shown interest in connecting with you.</p>
                                    <p>Please log in to your account to respond.</p>
                                    <a href="http://bondly.in/" class="button">Log In</a>
                                </div>
                            </div>
                        </div>
                    </body>
                </html>
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
