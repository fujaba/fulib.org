export const environment = {
  production: false,
  sentryDsn: 'https://613fdea31ffd44aa9f21da06ce6346e1@o416265.ingest.sentry.io/4505273320734720',
  environment: 'development',
  apiURL: 'http://localhost:4567/api',
  assignmentsApiUrl: 'http://localhost:21318/api/v1',
  projectsApiUrl: 'http://localhost:6266/api/v1',
  projectsProxyUrl: 'http://localhost:13147',
  workflowsUrl: 'http://localhost:11356/api/v1',
  auth: {
    url: 'https://se.uniks.de/auth',
    realm: 'fulib.org',
    clientId: 'fulib.org',
  },
};

import 'zone.js/plugins/zone-error';
