import * as Sentry from '@sentry/nestjs';
import {environment} from './environment';

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: environment.sentryDsn,
  initialScope: {
    tags: {
      service: 'projects',
    },
  },

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nestjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
