const { gql } = require('apollo-server-express');

const usertypeDef = gql`
    type User {
        id:ID!,
        userName:String!,
        email:String!,
        password:String!,
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

    type Query {
        users : [User],
        user(id:ID!): User
        UserPosts: UserPostsResponse!
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    input AddPostInput {
        content: String!
        imageURL: String
    }

    type Mutation {
        register(userName : String!, email:String!, password:String! ):AuthPayload
        login(email:String!,password:String!):AuthPayload
        addPost(input:AddPostInput!): Post!
    }
`


module.exports = usertypeDef