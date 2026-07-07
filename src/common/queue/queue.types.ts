import { JobsOptions } from 'bullmq';
import { QUEUES } from './queue.constants';

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

export type QueueJobName = string;

export type QueueJobPayload = Record<string, unknown>;

export type QueueEnqueueOptions = JobsOptions;
