import { InMemoryOrderRepository } from '../infrastructure/persistence/in-memory/InMemoryOrderRepository.js';
import { PostgresOrderRepository } from '../infrastructure/persistence/postgres/PostgresOrderRepository.js';
import { StaticPricingService } from '../infrastructure/http/StaticPricingService.js';
import { NoopEventBus } from '../infrastructure/messaging/NoopEventBus.js';
import { MessagingFactory } from '../infrastructure/messaging/MessagingFactory.js';
import { DatabaseFactory } from '../infrastructure/database/DatabaseFactory.js';
import { CreateOrder } from '../application/use-cases/CreateOrder.js';
import { AddItemToOrder } from '../application/use-cases/AddItemToOrder.js';
import { OrderRepository } from '../application/ports/OrderRepository.js';
import { PricingService } from '../application/ports/PricingService.js';
import { EventBus } from '../application/ports/EventBus.js';
import { Logger } from '../application/ports/Logger.js';
import { PinoLogger } from '../infrastructure/logging/PinoLogger.js';
import { ServerDependencies } from '../application/ports/ServerDependencies.js';
import { config } from './config.js';

export interface Dependencies extends ServerDependencies {
  // Ports
  orderRepository: OrderRepository;
  pricingService: PricingService;
  eventBus: EventBus;
  logger: Logger;
  // Optional cleanup function
  cleanup?: () => Promise<void>;
}

export function buildContainer(): Dependencies {
  const dbType = config.DATABASE_TYPE;

  // Infrastructure layer - Adapters
  const pricingService = new StaticPricingService();
  const logger = new PinoLogger();

  let orderRepository: OrderRepository;
  let eventBus: EventBus;
  let cleanup: (() => Promise<void>) | undefined;

  if (dbType === 'postgres') {
    const pool = DatabaseFactory.createPool();
    orderRepository = new PostgresOrderRepository(pool);
    eventBus = MessagingFactory.createEventBus('outbox');
    cleanup = async () => {
      await pool.end();
    };
  } else {
    orderRepository = new InMemoryOrderRepository();
    eventBus = MessagingFactory.createEventBus('noop');
  }

  // Application layer - Use Cases
  const createOrderUseCase = new CreateOrder(orderRepository, eventBus);
  const addItemToOrderUseCase = new AddItemToOrder(
    orderRepository,
    pricingService,
    eventBus,
  );

  return {
    // Ports
    orderRepository,
    pricingService,
    eventBus,
    logger,
    cleanup,

    // Use Cases
    createOrderUseCase,
    addItemToOrderUseCase,
  };
}
