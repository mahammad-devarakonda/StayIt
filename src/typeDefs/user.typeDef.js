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
    }


    type FeedUserResponce {
        id: ID!
        userName:String!
        avatar:String!
        bio:String!
        posts:[Post!]!
        createdAt: String!

    }

    type Query {
        users : [User],
        user(id: ID!): UserPostsResponse,
        UserPosts: UserPostsResponse!
        feed:[FeedUserResponce!]!
    }

    type AuthPayload {
        token: String!
        user: User!
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
        register(userName : String!, email:String!, password:String! ):AuthPayload
        login(email:String!,password:String!):AuthPayload
        getSignedUrl(filename: String!, fileType: String!): SignedUrlResponse!
        addPost(file: Upload!, content: String!): FileResponse!
    }
`


module.exports = usertypeDef