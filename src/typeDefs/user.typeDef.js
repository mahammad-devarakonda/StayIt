const { gql } = require('apollo-server-express');

const usertypeDef = gql`
    type User {
        id:ID!,
        userName:String!,
        email:String!,
        password:String!,
    }

    type Query {
        users : [User],
        user(id:ID!): User
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    type Mutation {
        register(userName : String!, email:String!, password:String! ):AuthPayload
        login(email:String!,password:String!):AuthPayload
    }
`


module.exports = usertypeDef