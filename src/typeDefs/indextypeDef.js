const { mergeTypeDefs } = require("@graphql-tools/merge")
const usertypeDef=require('./user.typeDef')
const connectTypeDef=require('./connections.typeDef')

const types=[usertypeDef,connectTypeDef,]

module.exports=mergeTypeDefs(types)

