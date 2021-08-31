export const environment = {
  version: 'v1',
  port: +process.env.PORT || 21318,
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://fulibDotOrg:fulibDotOrg@localhost:27017',
    options: {
    },
  },
};
