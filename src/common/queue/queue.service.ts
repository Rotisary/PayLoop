import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { DEFAULT_JOB_OPTIONS, QUEUES } from './queue.constants';
import {
  QueueEnqueueOptions,
  QueueJobName,
  QueueJobPayload,
} from './queue.types';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUES.OPT_IN)
    private readonly optInQueue: Queue<QueueJobPayload, unknown, QueueJobName>,
    @InjectQueue(QUEUES.BILLING)
    private readonly billingQueue: Queue<QueueJobPayload, unknown, QueueJobName>,
    @InjectQueue(QUEUES.WEBHOOK)
    private readonly webhookQueue: Queue<QueueJobPayload, unknown, QueueJobName>,
    @InjectQueue(QUEUES.NOTIFICATION)
    private readonly notificationQueue: Queue<QueueJobPayload, unknown, QueueJobName>,
  ) {}

  enqueueOptIn(
    jobName: QueueJobName, payload: QueueJobPayload, options?: QueueEnqueueOptions,
  ): Promise<Job<QueueJobPayload, unknown, QueueJobName>> {
    return this.addJob(this.optInQueue, jobName, payload, options);
  }

  enqueueBilling(
    jobName: QueueJobName, payload: QueueJobPayload, options?: QueueEnqueueOptions,
  ): Promise<Job<QueueJobPayload, unknown, QueueJobName>> {
    return this.addJob(this.billingQueue, jobName, payload, options);
  }

  enqueueWebhook(
    jobName: QueueJobName, payload: QueueJobPayload, options?: QueueEnqueueOptions,
  ): Promise<Job<QueueJobPayload, unknown, QueueJobName>> {
    return this.addJob(this.webhookQueue, jobName, payload, options);
  }

  enqueueNotification(
    jobName: QueueJobName, payload: QueueJobPayload, options?: QueueEnqueueOptions,
  ): Promise<Job<QueueJobPayload, unknown, QueueJobName>> {
    return this.addJob(this.notificationQueue, jobName, payload, options);
  }

  private addJob(
    queue: Queue<QueueJobPayload, unknown, QueueJobName>,
    jobName: QueueJobName,
    payload: QueueJobPayload,
    options?: QueueEnqueueOptions,
  ): Promise<Job<QueueJobPayload, unknown, QueueJobName>> {
    return queue.add(jobName, payload, this.getJobOptions(options));
  }

  private getJobOptions(options?: QueueEnqueueOptions): QueueEnqueueOptions {
    return {
      ...DEFAULT_JOB_OPTIONS,
      ...options,
    };
  }
}
