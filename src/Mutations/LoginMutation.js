const bcrypt = require('bcrypt');
const User = require('../model/User');
const redis = require('../utills/redisSetUp');
const genrateOTP = require('../utills/GenrateOtp');
const { sendOtpMail } = require('../utills/SendOTPEmail');
const { AuthenticationError, ApolloError } = require('apollo-server');

const normalizeEmail = (email) => email.trim().toLowerCase();

const login = async (_, { email, password }) => {
  if (!email || !password) {
    throw new ApolloError("Email and password are required", "BAD_USER_INPUT");
  }

  const normalizedEmail = normalizeEmail(email);
  console.log('🔍 Attempting login for:', normalizedEmail);

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AuthenticationError("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid credentials");
  }

  const otp = genrateOTP();

  try {
    await redis.set(`otp:${normalizedEmail}`, otp, { EX: 300 }); 
  } catch (error) {
    console.error("❌ Redis error:", error);
    throw new ApolloError("Internal server error", "REDIS_ERROR");
  }

  try {
    await sendOtpMail(normalizedEmail, otp);
  } catch (emailErr) {
    console.error("❌ Email send failed:", emailErr);
    throw new ApolloError("Failed to send OTP email", "EMAIL_ERROR");
  }

  return { message: "OTP sent to your registered email ID." };
};

module.exports = login;
