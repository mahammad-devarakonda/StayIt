const express = require('express')
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./utills/config');
const mergeResolvers = require('./resolvers/indexResolver')
const mergeTypeDefs = require('./typeDefs/indextypeDef')
const userAuthMiddleware = require('./middleWare/authMiddleware')
const cookieParser = require('cookie-parser');

const startServer = async () => {
    const app = express()
    const PORT = 3000;

    app.use(express.json());
    app.use(cookieParser());

    const server = new ApolloServer({
        typeDefs: mergeTypeDefs,
        resolvers: mergeResolvers,
        context: ({ req, res }) => {
            const user = userAuthMiddleware(req)
            return { res, user }
        },  
    })

    await server.start()
    server.applyMiddleware({ app });


    connectDB()
        .then(() => {
            console.log("Connection established.......");
            app.listen(PORT, () => {
                console.log(`Server is listening on ${PORT} port`);
            })
        })
        .catch((err) => {
            console.log("Connection is not established!!..", err);
        })
}

startServer()