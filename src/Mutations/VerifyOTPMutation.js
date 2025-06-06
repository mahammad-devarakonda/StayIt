const jwt = require('jsonwebtoken')
const redis = require('../utills/redisSetUp')
const User=require('../model/User')

const verifyOTP = async (_, { email, otp }, { res }) => {

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found.");
    }

    try {
      const storedOtp = await redis.get(`otp:${email}`);
      
      if (!storedOtp) {
        throw new Error("OTP expired or invalid.");
      }
  
      if (storedOtp !== otp) {
        throw new Error("Incorrect OTP. Please try again.");
      }
  
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d", // from 24h to 7d
      });
      
      res.cookie('authToken', token, { 
        httpOnly: true, 
        sameSite: "None",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
  
      await redis.del(`otp:${email}`);
      return { message: "OTP verified successfully!", token, user };
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      throw new Error(error.message);
    }
  };


module.exports=verifyOTP  