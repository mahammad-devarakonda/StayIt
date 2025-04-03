const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../model/User')
const sendOTPEmail = require('../utills/SendOTPEmail')
const nodemailer = require("nodemailer")
const genrateOTP = require('../utills/GenrateOtp')
const redis=require('../utills/redisSetUp')

const register = async (_, { userName, email, password }, { res }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists! Please use another email to register.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        userName,
        email,
        password: hashedPassword,
    });

    const otp = genrateOTP()
    try {
        await redis.set(`otp:${user.email}`, otp, { EX: 300 });
        console.log(`✅ OTP stored in Redis for ${user.email}`);
    } catch (error) {
        console.error("❌ Error storing OTP in Redis:", error);
        throw new Error("Internal server error");
    }
    await user.save();
    sendOTPEmail(user.email, otp);

    return { message: `You are registred sucessfully with ${email} please verify with OTP` };
};


module.exports = register