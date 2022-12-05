export const environment = {
  production: true,
  apiURL: 'http://localhost:4567/api',
  assignmentsApiUrl: 'http://localhost:21318/api/v1',
  projectsApiUrl: 'http://localhost:6266/api/v1',
  projectsProxyUrl: 'http://localhost:13147',
  workflowsUrl: 'http://localhost:11356/api/v1',
  auth: null as {
    url: string;
    realm: string;
    clientId: string;
  } | null,
};
