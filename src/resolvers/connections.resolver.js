const reviewRequestConnection = require('../Mutations/reviewRequestConnection')
const sendRequestConnection = require('../Mutations/sendRequestConnection')
const myRequests=require('../Query/myRequestsQuery')


const connectionResolver = {
    Query: {
        myRequests,
    },
    Mutation: {
        sendRequestConnection,
        reviewRequestConnection
    }
}

module.exports = connectionResolver