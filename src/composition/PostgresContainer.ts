import { StaticPricingService } from '../infrastructure/http/StaticPricingService.js';
import { NoopEventBus } from '../infrastructure/messaging/NoopEventBus.js';
import { PinoLogger } from '../infrastructure/logging/PinoLogger.js';
import { CreateOrderWithUoW } from '../application/use-cases/CreateOrderWithUoW.js';
import { PricingService } from '../application/ports/PricingService.js';
import { EventBus } from '../application/ports/EventBus.js';
import { Logger } from '../application/ports/Logger.js';
import { UnitOfWork } from '../application/ports/UnitOfWork.js';
import { DatabaseFactory } from '../infrastructure/database/DatabaseFactory.js';

export interface PostgresDependencies {
  // Ports
  unitOfWork: UnitOfWork;
  pricingService: PricingService;
  eventBus: EventBus;
  logger: Logger;

  // Use Cases
  createOrderUseCase: CreateOrderWithUoW;
}

export function buildPostgresContainer(): PostgresDependencies {
  // Infrastructure layer - Adapters
  const unitOfWork = DatabaseFactory.createUnitOfWork();
  const pricingService = new StaticPricingService();
  const eventBus = new NoopEventBus();
  const logger = new PinoLogger();

  // Application layer - Use Cases
  const createOrderUseCase = new CreateOrderWithUoW(unitOfWork, eventBus);

  return {
    // Ports
    unitOfWork,
    pricingService,
    eventBus,
    logger,

    // Use Cases
    createOrderUseCase,
  };
}

// Cleanup function for graceful shutdown
export async function closeContainer(): Promise<void> {
  await DatabaseFactory.closePool();
}
