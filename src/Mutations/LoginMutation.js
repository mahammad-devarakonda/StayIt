const bcrypt = require('bcrypt');
const User = require('../model/User');
const redis = require('../utills/redisSetUp');
const genrateOTP = require('../utills/GenrateOtp');
const { sendOtpMail } = require('../utills/SendOTPEmail');

const login = async (_, { email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Please enter valid credentials!");
  }

  const otp = genrateOTP();

  try {
    await redis.set(`otp:${email}`, otp, { EX: 300 }); // 5 minutes
  } catch (error) {
    console.error("❌ Redis error:", error);
    throw new Error("Internal server error");
  }

  try {
    await sendOtpMail(email, otp);
  } catch (emailErr) {
    console.error("❌ Email send failed:", emailErr);
    throw new Error("Failed to send OTP email");
  }

  return { message: "OTP sent to your registered email ID." };
};

module.exports = login;
