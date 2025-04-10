const jwt = require('jsonwebtoken')
const redis = require('../utills/redisSetUp')
const User=require('../model/User')

const verifyOTP = async (_, { email, otp }, { res }) => {

  console.log(email,otp);
  
    const user = await User.findOne({ email });
  
    try {
      const storedOtp = await redis.get(`otp:${email}`);
      console.log("this is stored otp",storedOtp);
      
  
      if (!storedOtp) {
        throw new Error("OTP expired or invalid.");
      }
  
      if (storedOtp !== otp) {
        throw new Error("Incorrect OTP. Please try again.");
      }
  
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('authToken', token, { httpOnly: true, sameSite: "lax" });
  
      await redis.del(`otp:${email}`);
      return { message: "OTP verified successfully!", token, user };
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      throw new Error(error.message);
    }
  };


module.exports=verifyOTP  