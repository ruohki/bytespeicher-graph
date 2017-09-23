/* Express Module Importieren */
import express from 'express';
const router = express.Router();
import { apolloExpress, graphiqlExpress } from 'apollo-server';
import bodyParser from 'body-parser';

/* Endpunkt Objekte Importieren */
import * as byteStatus from './byteStatus';

/*
  Helfer Funktionen
*/

/**
 * Erstellt einen Apollo Server für den Endpoint
 * @param {Object} endpointObject Das importiere Endpoint Objekt
 */
const setupGraphQl = (endpointObject) => endpointObject.route.use('/graphql', bodyParser.json(), apolloExpress({ schema: endpointObject.schema, context: {}}));

/**
 * Erstellt einen GraphiQL Endpunkt im Endpoint
 * @param {Object} endpointObject Das importiere Endpoint Objekt
 */
const setupGraphiQl = (endpointObject) => endpointObject.route.use('/graphiql', graphiqlExpress({ endpointURL: 'graphql' }));

/**
 * Regisriert einen Endpoint im Express Framework
 * @param {Object} router Der Express Router auf dem der Endpunkt registriert wird
 * @param {Object} endpointObject Das importiere Endpoint Objekt
 */
const registerEndpoint = (router, endpointObject) => {
  setupGraphQl(endpointObject);
  setupGraphiQl(endpointObject);
  router.use(endpointObject.routeName, endpointObject.route);
}

/* Neue Endpunkte hier nach dem Schema einbinden */
registerEndpoint(router, byteStatus);

/* Export der Modulinhalte */
export default router;