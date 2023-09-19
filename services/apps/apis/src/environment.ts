export const environment = {
  version: 'v1',
  port: +(process.env.PORT || 34792),
  nodeEnv: process.env.NODE_ENV || 'development',
  servers: (process.env.SERVERS || 'Assignments=http://localhost:21318\nProjects=http://localhost:6266')
    .split('\n')
    .map(line => line.split('=').map(s => s.trim())),
};
