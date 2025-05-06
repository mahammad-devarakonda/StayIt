const { gql } = require('apollo-server-express');

const usertypeDef = gql`
    type User {
        id:ID!,
        userName:String!,
        email:String!,
        password:String!,
        avatar:String
        bio:String
    }

    type Post {
        id:ID!,
        content: String!
        description:String
        imageURL: String!
    }

    type UserPostsResponse {
        user: User!
        posts: [Post!]!
        connection:Int!
    }


    type FeedUserResponce {
        id: ID!
        userName:String!
        avatar:String!
        bio:String!
        connectionStatus:String
        posts:[Post!]!
        createdAt: String!
    }

    type chatResponce {
        id: ID!
        participants:[String!]!
        message: [Message!]!
        timestamp: String!
    }

    type Message {
        sender: User!  
        text: String!
        sentAt: String!
    }

    type Query {
        users : [User],
        user(id: ID, email: String): UserPostsResponse,
        UserPosts: UserPostsResponse!
        feed:[FeedUserResponce!]!
        MyConnections(id: ID!):[User]
        chat(id:ID!):chatResponce
    }
    type AuthPayload {
        message:String!
        user: User!
        token:String!
    }

    type OTPResponse {
        message: String!
    }

    input AddPostInput {
        content: String!
        imageURL: String
    }

    type SignedUrlResponse {
        url: String!
        fileUrl: String!
    }

    scalar Upload

    type FileResponse {
        success: Boolean!
        message: String!
        fileUrl: String
        fileDetails:Post!
    }


    type Mutation {
        register(userName : String!, email:String!, password:String! ):OTPResponse!
        login(email:String!,password:String!):OTPResponse!
        verifyOTP(email:String!,otp:String!):AuthPayload
        getSignedUrl(filename: String!, fileType: String!): SignedUrlResponse!
        addPost(file: Upload!, content: String!): FileResponse!
    }
`


module.exports = usertypeDef