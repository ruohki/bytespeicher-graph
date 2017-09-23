import express from 'express';

import endpoints from './endpoints';

const GRAPHQL_PORT = process.env.PORT || 8080;
const graphQLServer = express();

graphQLServer.use('/api', endpoints);

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `Apollo Server is now running...`
));