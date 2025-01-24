const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User=require('../model/User')

const userResolver={
    Query:{
        user : async()=>{
            try {
                await User.findById(id)

            } catch (error) {
                throw new Error("No user Found")
            }
        },
        users: async () => {
            try {
                return await User.find()
            } catch (error) {
                throw new Error("Error in fetching users")
            }
        },
    },


    Mutation:{
        register: async (_, { userName, email, password }, { res }) => {
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
        
            await user.save(); // Ensure the user is saved properly.
            // Use the `user` object for the token
            const token = jwt.sign({ user:user._id}, "Bahubali#01", { expiresIn: '1h' });
            res.cookie('authToken', token, { httpOnly: true, sameSite: "lax" });
        
            return { token, user }; // Return the token and the created user
        },
        


        login: async (_, { email, password },{res}) => {
           
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw new Error("Please enter valid credentionals!");

            const token = jwt.sign({ userId: user.id }, "Bahubali#01", { expiresIn: '1h' });
            res.cookie('authToken', token, { httpOnly: true, sameSite: "lax" });
            return { token, user }
        },
    }
}

module.exports=userResolver