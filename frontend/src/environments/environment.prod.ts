declare const BUILD_VERSION: string;

export const environment = {
  production: true,
  version: BUILD_VERSION,
  sentryDsn: 'https://613fdea31ffd44aa9f21da06ce6346e1@o416265.ingest.sentry.io/4505273320734720',
  environment: 'production',
  apiURL: '/api',
  assignmentsApiUrl: '/api/v1',
  projectsApiUrl: '/api/v1',
  projectsProxyUrl: '',
  workflowsUrl: '/api/v1',
  auth: {
    url: 'https://se.uniks.de/auth',
    realm: 'fulib.org',
    clientId: 'fulib.org',
  },
};
