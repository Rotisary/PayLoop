import { JobsOptions } from 'bullmq';

export const QUEUES = {
  OPT_IN: 'opt-in',
  BILLING: 'billing',
  WEBHOOK: 'webhook',
  NOTIFICATION: 'notification',
} as const;

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 3000,
  },
  removeOnComplete: {
    age: 3600,
    count: 1000,
  },
  removeOnFail: {
    age: 604800,
    count: 5000,
  },
};
