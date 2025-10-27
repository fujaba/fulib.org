export const environment = {
  version: 'v1',
  port: +(process.env.PORT || 6266),
  nodeEnv: process.env.NODE_ENV || 'development',
  sentryDsn: process.env.SENTRY_DSN || 'https://613fdea31ffd44aa9f21da06ce6346e1@o416265.ingest.sentry.io/4505273320734720',
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fulib-org',
    options: {
    },
  },
  docker: {
    host: process.env.DOCKER_HOST,
    port: process.env.DOCKER_PORT,
    socket: process.env.DOCKER_HOST ? undefined : process.platform !== 'win32' ? '/var/run/docker.sock' : '//./pipe/docker_engine',
    version: process.env.DOCKER_VERSION || 'v1.41',
    bindPrefix: process.env.FULIB_PROJECTS_DATA_DIR || 'data',
    containerImage: process.env.FULIB_PROJECTS_CONTAINER_IMAGE || 'registry.uni-kassel.dev/fulib/code-server-fulib:17',
    proxyHost: process.env.FULIB_PROJECTS_PROXY_URL || 'http://localhost:13147',
    network: process.env.FULIB_PROJECTS_NETWORK || 'fuliborg_projects',
    heartbeatTimeout: +(process.env.FULIB_PROJECTS_HEARTBEAT_TIMEOUT || 15) * 60,
  },
  auth: {
    realm: 'fulib.org',
    publicKey: `-----BEGIN PUBLIC KEY-----\n${
      process.env.AUTH_PUBLIC_KEY || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjSudUTRH8wtEeIQdKh4Yv97HcFGjLzl9+yBm+SO2lf2r/jvpbSRPWqMDbrgQ0BGDwMQLweUoPUzOhZbrScs5edhRxtn3nPKUTiBtOoFiYupTTicdIKY1FAlagSM4/7WBbj0CT14cXQoyZK2VbfYXsu19tdJ/oFPBAGwrsj/ugiGE6c8H6wu4yHPsJFDR8sN524NN4diXOKyZ731IP5lqfN4+bP17/b1KaDG8swsRNW93dfEz0nfcJu+wutI3dLc98/cekOpHUZRzndsshifjuM39RF6oyI89tcuwrrKqrz5HV9CsPBUB2hakGBhg71svZyq304ikQFYej/ydZd0biwIDAQAB'
    }\n-----END PUBLIC KEY-----`,
    resource: process.env.AUTH_RESOURCE || 'projects-service',
    algorithms: (process.env.AUTH_ALGORITHMS || 'RS256').split(','),
    issuer: process.env.AUTH_ISSUER || 'https://fulib.uni-kassel.dev/auth/realms/fulib.org',
  },
  nats: {
    servers: process.env.NATS_URL || 'nats://localhost:4222',
  },
};
