const express = require('express')
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./utills/config');
const mergeResolvers = require('./resolvers/indexResolver')
const mergeTypeDefs = require('./typeDefs/indextypeDef')
const userAuthMiddleware = require('./middleWare/authMiddleware')
const cookieParser = require('cookie-parser');
require('dotenv').config();

const startServer = async () => {

    const app = express()
    const PORT = process.env.PORT;
    const cors = require('cors');

    app.use(cors({
        origin: process.env.FRONTEND, // Allow the frontend's origin
        credentials: true, // Allow sending cookies
    }));

    app.use(express.json());
    app.use(cookieParser());

    app.use((req,res,next)=>{
        console.log(req.body);
        next()
    })

    const server = new ApolloServer({
        typeDefs: mergeTypeDefs,
        resolvers: mergeResolvers,
        context: ({ req, res }) => {
            const user = userAuthMiddleware(req)
            return { res, user }
        },
        playground: true,
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