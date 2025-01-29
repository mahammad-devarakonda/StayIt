const { mergeResolvers } = require("@graphql-tools/merge")
const connectionResolver=require('./connections.resolver')
const userResolver=require('./user.resolver')



const resolvers = [userResolver,connectionResolver]


module.exports = mergeResolvers(resolvers)