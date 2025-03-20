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
        console.error("Authentication Error:", err.message);
        return { res, user: null, io };
      }
    },
    playground: true,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  console.log(`🚀 Apollo Server ready at /graphql`);
};

module.exports = createGraphQLServer;
