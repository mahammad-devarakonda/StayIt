const { gql } = require('apollo-server-express');


const connectTypeDef = gql`

    type User {
        id: ID!
        userName: String!
        email: String!
    }

    type Request {
        id: ID!
        fromUser: User!
        toUser: User!
        status: String!
        timestamp: String!
    }

    input SendRequestInput {
        toUser: String!
        status: String!
    }

    input ReviewRequest {
        requestedUser: ID!
        status: String!
    }

    type RequestResponse {
        success: Boolean!
        message: String!
        request: Request
    }

    type Mutation {
        sendRequestConnection(input: SendRequestInput!):RequestResponse
        reviewRequestConnection(input: ReviewRequest!): RequestResponse
    }

    type Query {
        myRequests: [Request!]!
    }
`

module.exports = connectTypeDef
