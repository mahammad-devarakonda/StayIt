const Connection = require('../model/Connections');
const cron = require('node-cron');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const sendNotificationEmail = require('../utills/SendNotificationEmail');

const yesterday = subDays(new Date(), 1);
const yesterdayStart = startOfDay(yesterday);
const currentTimeAndDate = endOfDay(new Date());

cron.schedule('1 * * * *', async () => {
    const pendingRequests = await Connection.find({
        status: "interested",
        createdAt: {
            $gte: yesterdayStart,
            $lt: currentTimeAndDate,
        }
    }).populate("fromUser toUser");


    console.log(pendingRequests);
    

    const emailsToSend = [];

    for (const request of pendingRequests) {
        const toEmail = request.toUser?.email;
        const fromUserName = request.fromUser?.name || 'Someone';

        if (toEmail) {
            emailsToSend.push(sendNotificationEmail(toEmail, fromUserName));
        }
    }

    await Promise.all(emailsToSend);

}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});
