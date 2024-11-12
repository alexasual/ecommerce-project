require('dotenv').config();
const { createYoga } = require('graphql-yoga');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const resolvers = require('./graphql/resolvers');
const path = require('path');
const http = require('http');
const { createLogger, transports, format } = require('winston');

// Load environment variables
const PORT = process.env.GRAPHQL_PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Setup logging
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'server.log' })
  ],
});

const typesArray = loadFilesSync(path.join(__dirname, 'graphql/**/*.graphql'));
const schema = makeExecutableSchema({
  typeDefs: typesArray,
  resolvers,
});

const yoga = createYoga({
  schema,
  landingPage: NODE_ENV === 'development',
  graphqlEndpoint: '/',
  context: ({ request }) => {
    return { request };
  },
  plugins: [
    {
      onError: ({ error }) => {
        logger.error('GraphQL Error:', error);
      },
    },
  ],
});

const server = http.createServer(yoga);

server.listen(PORT, () => {
  logger.info(`GraphQL server is running on http://localhost:${PORT}`);
});