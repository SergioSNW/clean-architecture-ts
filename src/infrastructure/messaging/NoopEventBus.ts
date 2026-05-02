import { DomainEvent } from '../../domain/events/domain-event.js';
import { Result, ok } from '../../shared/Result.js';
import { EventBus } from '../../application/ports/EventBus.js';
import { AppError } from '../../application/errors.js';

export class NoopEventBus implements EventBus {
  async publish(_events: DomainEvent[]): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}
