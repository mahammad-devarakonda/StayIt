const Connection = require('../model/Connections');
const cron = require('node-cron');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const sendNotificationEmail = require('../utills/SendNotificationEmail');

const yesterday = subDays(new Date(), 1);
const yesterdayStart = startOfDay(yesterday);
const currentTimeAndDate = endOfDay(new Date());

cron.schedule('0 8 * * *', async () => {
    const pendingRequests = await Connection.find({
        status: "interested",
        createdAt: {
            $gte: yesterdayStart,
            $lt: currentTimeAndDate,
        }
    }).populate("fromUser toUser");

    const emailsToSend = {};

    for (const request of pendingRequests) {
        const toEmail = request?.toUser?.email;
        const toUserName = request?.toUser?.userName;
        const fromUserName = request?.fromUser?.userName;

        if (toEmail) {
            if (!emailsToSend[toEmail]) {
                emailsToSend[toEmail] = {
                    toUserName,
                    fromUserNames: []
                };
            }
            emailsToSend[toEmail].fromUserNames.push(fromUserName);
        }
    }

    const emailPromises = Object.keys(emailsToSend).map(async (email) => {
        const { toUserName, fromUserNames } = emailsToSend[email];
        const fromUserNamesList = fromUserNames.join(', '); 
        return sendNotificationEmail(email, fromUserNamesList, toUserName);
    });

    await Promise.all(emailPromises);

}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});
