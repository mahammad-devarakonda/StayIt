const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../model/User')
const redis=require('../utills/redisSetUp')
const genrateOTP=require('../utills/GenrateOtp')
const sendOTPEmail=require('../utills/SendOTPEmail')


const login = async (_, { email, password }) => {
    const user = await User.findOne({ email });

    console.log(user);
    
  
    if (!user) {
      throw new Error("User not found");
    }

    const otp=genrateOTP()
  
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Please enter valid credentials!");
   
    try {
      await redis.set(`otp:${email}`, otp, { EX: 300 });
      console.log(`✅ OTP stored in Redis for ${email}`);
      const storedOtp = await redis.get(`otp:${email}`);
      console.log(`✅ OTP stored in Redis ${storedOtp}`);
    } catch (error) {
      console.error("❌ Error storing OTP in Redis:", error);
      throw new Error("Internal server error");
    }
  
    sendOTPEmail(user.email, otp);
  
    return { message: `OTP sent to registered email ID.` };
  };
  
  module.exports=login