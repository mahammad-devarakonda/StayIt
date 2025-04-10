const Connection=require('../model/Connections')
const cron = require('node-cron');
const {subDays, startOfDay, endOfDay}=require('date-fns')
const sendNotifiacationEmail=require('./SendNotificationEmail')

const yesterday=subDays(new Date(),1)
const yesterdayStart=startOfDay(yesterday)
const currentTimeAndDate=endOfDay(new Date())
cron.schedule('0 8 * * *', async() => {
    const pendingRequests=await Connection.find({
        status:"interested",
        createdAt:{
            $gte:yesterdayStart,
            $lt:currentTimeAndDate,
        }
    }).populate("fromUser toUser")


    const listOfEmailId=[...new Set(pendingRequests.map(req=>req.toUser.email))]

    for(const email of listOfEmailId){
        if (email) { 
            await sendNotifiacationEmail(email);
        }
    }
    
    
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" 
});
