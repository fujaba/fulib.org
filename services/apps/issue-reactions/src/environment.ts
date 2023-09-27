import {MongooseModuleOptions} from "@nestjs/mongoose";

export const environment = {
  version: 'v1',
  port: +(process.env.PORT || 31606),
  nodeEnv: process.env.NODE_ENV || 'development',
  sentryDsn: process.env.SENTRY_DSN || 'https://613fdea31ffd44aa9f21da06ce6346e1@o416265.ingest.sentry.io/4505273320734720',
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fulib-org',
    options: {} satisfies MongooseModuleOptions,
  },
};
