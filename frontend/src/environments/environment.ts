declare const BUILD_VERSION: string;

export const environment = {
  production: false,
  version: BUILD_VERSION,
  sentryDsn: '',
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
