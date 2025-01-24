const { gql } = require('apollo-server-express');


const connectTypeDef = gql`

    type Request {
        id: ID!
        fromUser: User!
        toUser: User!
        status: String!
        timestamp: String!
    }
    type User {
        id: ID!
        userName: String!
        email: String!
    }

    input SendRequestInput {
        toUser: String!
        status: String!
    }

    type RequestResponse {
        success: Boolean!
        message: String!
        toUser: User
        status: String
        timestamp: String
    }


    type Mutation {
        sendRequestConnection(input: SendRequestInput):RequestResponse
        reviewRequestConnection(requestedUser: String!, status: String!): RequestResponse
    }

    type Query {
        myRequests: [Request!]!

    }
`

module.exports = connectTypeDef
