import { EventBus } from '../../application/ports/EventBus.js';
import { OutboxEventBus } from './OutboxEventBus.js';
import { NoopEventBus } from './NoopEventBus.js';
import { OutboxDispatcher } from './OutboxDispatcher.js';
import { DatabaseFactory } from '../database/DatabaseFactory.js';

export class MessagingFactory {
  static createEventBus(type: 'outbox' | 'noop' = 'outbox'): EventBus {
    if (type === 'noop') {
      return new NoopEventBus();
    }

    const pool = DatabaseFactory.createPool();
    return new OutboxEventBus(pool);
  }

  static createOutboxDispatcher(
    batchSize = 100,
    intervalMs = 5000,
  ): OutboxDispatcher {
    return new OutboxDispatcher(batchSize, intervalMs);
  }
}
