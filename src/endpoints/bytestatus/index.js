/*
  API Endpoint für die Erfurter Parkhausdaten

*/

import express from 'express';
const router = express.Router();

import { makeExecutableSchema } from 'graphql-tools';

import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/de';

/* MongoDB Stuff */
import MongoClient from 'mongodb';
const mongoDB = 'mongodb://bytespeicher:byteberry23@ruohki.de:37017/bytespeicher';

/* Konstanten */
const routeName = "/parkdata"

/* Schema und Resolver */
const executableSchema = makeExecutableSchema({
  typeDefs: `
    enum OrderBy {
      open
      timestamp
    }

    enum Ordering {
      asc
      desc
    }

    enum Timeformat {
      UTC
      Unix
      GMT
    }

    type Status {
      open: Boolean
      timestamp(format: Timeformat): String
    }

    type Query {
      status(
        open: Boolean
        
        from: String
        to: String

        orderBy: OrderBy
        ordering: Ordering

        limit: Int
        skip: Int
      ): [Status]
    }
  
    schema {
      query: Query
    }
  `,
  resolvers: {
    Status: {
      timestamp(root, args) {
        const { format = "Unix"} = args

        if (format === "Unix") {
          return Math.round(root.timestamp/1000);
        } else if (format === "UTC") {
          return moment.unix(Math.round(root.timestamp / 1000)).toISOString();
        } else if (format === "GMT") {
          return moment.unix(Math.round(root.timestamp / 1000)).locale('de').toLocaleString();
        } else {
          return Math.round(root.timestamp/1000);
        }
      }
    },
    Query: {
      async status(root, args) {
        const result = await new Promise ((resolve, reject) => {
          MongoClient.connect(mongoDB, (err, db) => {
            if (err) {
              return reject(err);
            }
            const col = db.collection('bytestatus');
            
            let query = {}

            let {
              limit = 1000,
              skip = 0,
              orderBy = "timestamp",
              ordering = "asc"
            } = args;

            limit = limit > 1000 ? 1000 : limit;

            if (_.has(args, "open")) {
              query.open = args.open
            }

            if (_.has(args, "from")) {
              query.timestamp = Object.assign({}, query.timestamp)
              query.timestamp["$gte"] = !isNaN(args.from) ? args.from * 1000 :  moment(args.from).unix() * 1000
            }

            if (_.has(args, "to")) {
              query.timestamp = Object.assign({}, query.timestamp)
              query.timestamp["$lte"] = !isNaN(args.to) ? args.to * 1000 :  moment(args.to).unix() * 1000
            }

            col.find(query).sort(orderBy, ordering === "asc" ? 1 : -1).skip(skip).limit(limit).toArray((err, docs) => {
              return resolve(docs);
            })
          });
        });

        return result;
      }
    }
  }
})

/* Export der Modulinhalte */
export {
  router as route,
  routeName,
  executableSchema as schema
}