const { ApolloServer } = require("apollo-server-express");
const mergeResolvers = require("../resolvers/indexResolver");
const mergeTypeDefs = require("../typeDefs/indextypeDef");
const userAuthMiddleware = require("../middleWare/authMiddleware");

const createGraphQLServer = async (app, io) => {
  const apolloServer = new ApolloServer({
    typeDefs: mergeTypeDefs,
    resolvers: mergeResolvers,
    context: ({ req, res }) => {
      try {
        const user = userAuthMiddleware(req);
        return { res, user, io };
      } catch (err) {
        throw new Error(`Authentication failed: ${err.message}`);
      }
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ 
    app,
    cors: {
    origin: 'http://localhost:5173',  // Frontend URL
    credentials: true,               // Allow credentials (cookies, etc.)
  }
  });
  console.log(`🚀 Apollo Server ready at /graphql`);
};

module.exports = createGraphQLServer;
