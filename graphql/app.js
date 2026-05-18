require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  context: async ({ req }) => ({ req }),
  listen: { port: process.env.GRAPHQLPORT },
}).then(({ url }) => {
  console.log(`Servidor GraphQL rodando em ${url}`);
});
