const mongoose=require('mongoose')


const connectDB=async()=>{
    try{
        await mongoose.connect(
            "mongodb+srv://devarakondahuzefa01:x9MPjjDzfPVzJUmx@stayit.ezvy6.mongodb.net/StayIt"
        )
    }catch(err){
        console.error('Connection error:', err.message);
    }
}


module.exports=connectDB