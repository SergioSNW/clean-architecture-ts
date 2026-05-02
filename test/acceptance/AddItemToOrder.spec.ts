import { describe, it, expect, beforeEach } from 'vitest';
import { AddItemToOrder } from '../../src/application/use-cases/AddItemToOrder.ts';
import { OrderRepository } from '../../src/application/ports/OrderRepository.ts';
import { PricingService } from '../../src/application/ports/PricingService.ts';
import { EventBus } from '../../src/application/ports/EventBus.ts';
import { Order } from '../../src/domain/entities/Order.ts';
import { SKU } from '../../src/domain/value-objects/SKU.ts';
import { Money } from '../../src/domain/value-objects/Money.ts';
import { Currency } from '../../src/domain/value-objects/Currency.ts';
import { Result, ok, fail } from '../../src/shared/Result.ts';
import { AppError, NotFoundError } from '../../src/application/errors.ts';

// In-memory Order Repository
class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<Result<void, AppError>> {
    const cloned = this.cloneOrder(order);
    this.orders.set(order.sku.value, cloned);
    return ok(undefined);
  }

  async findById(sku: SKU): Promise<Result<Order, AppError>> {
    const order = this.orders.get(sku.value);
    if (!order) {
      return fail(new NotFoundError('Order', sku.value));
    }
    return ok(this.cloneOrder(order));
  }

  private cloneOrder(order: Order): Order {
    const cloned = new Order(order.sku);
    for (const item of order.items) {
      cloned.addItem(item.productSku, item.quantity, item.unitPrice);
    }
    cloned.clearEvents();
    return cloned;
  }

  // Test helper
  setOrder(order: Order): void {
    this.orders.set(order.sku.value, order);
  }

  clear(): void {
    this.orders.clear();
  }
}

// In-memory Pricing Service
class InMemoryPricingService implements PricingService {
  private prices = new Map<string, Money>();

  async getPrice(productSku: SKU): Promise<Result<Money, AppError>> {
    const price = this.prices.get(productSku.value);
    if (!price) {
      return fail(new NotFoundError('Product price', productSku.value));
    }
    return ok(price);
  }

  // Test helper
  setPrice(sku: string, amount: number, currency: Currency): void {
    this.prices.set(sku, new Money(amount, currency));
  }

  clear(): void {
    this.prices.clear();
  }
}

// In-memory Event Bus
class InMemoryEventBus implements EventBus {
  private publishedEvents: any[] = [];

  async publish(events: any[]): Promise<Result<void, AppError>> {
    this.publishedEvents.push(...events);
    return ok(undefined);
  }

  // Test helper
  getPublishedEvents(): any[] {
    return this.publishedEvents;
  }

  clear(): void {
    this.publishedEvents = [];
  }
}

describe('AddItemToOrder - Acceptance Test', () => {
  let orderRepository: InMemoryOrderRepository;
  let pricingService: InMemoryPricingService;
  let eventBus: InMemoryEventBus;
  let addItemToOrder: AddItemToOrder;
  let usd: Currency;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    pricingService = new InMemoryPricingService();
    eventBus = new InMemoryEventBus();
    addItemToOrder = new AddItemToOrder(
      orderRepository,
      pricingService,
      eventBus,
    );
    usd = new Currency('USD');

    // Setup test data
    pricingService.setPrice('LAPTOP-001', 999.99, usd);
    pricingService.setPrice('MOUSE-001', 29.99, usd);
    pricingService.setPrice('KEYBOARD-001', 79.99, usd);

    const order = new Order(new SKU('ORDER-001'));
    orderRepository.setOrder(order);
  });

  describe('successful scenarios', () => {
    it('should add item to existing order', async () => {
      const dto = {
        orderSku: 'ORDER-001',
        productSku: 'LAPTOP-001',
        quantity: 1,
      };

      const result = await addItemToOrder.execute(dto);

      expect(result.success).toBe(true);
    });

    it('should add multiple items to order', async () => {
      await addItemToOrder.execute({
        orderSku: 'ORDER-001',
        productSku: 'LAPTOP-001',
        quantity: 1,
      });

      await addItemToOrder.execute({
        orderSku: 'ORDER-001',
        productSku: 'MOUSE-001',
        quantity: 2,
      });

      const orderResult = await orderRepository.findById(new SKU('ORDER-001'));
      expect(orderResult.success).toBe(true);
      expect(orderResult.data.items).toHaveLength(2);
    });

    it('should publish events after adding item', async () => {
      eventBus.clear();

      await addItemToOrder.execute({
        orderSku: 'ORDER-001',
        productSku: 'LAPTOP-001',
        quantity: 1,
      });

      const events = eventBus.getPublishedEvents();
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('error scenarios', () => {
    it('should fail when order does not exist', async () => {
      const dto = {
        orderSku: 'NON-EXISTENT',
        productSku: 'LAPTOP-001',
        quantity: 1,
      };

      const result = await addItemToOrder.execute(dto);

      expect(result.success).toBe(false);
      expect(result.error.constructor.name).toBe('NotFoundError');
    });

    it('should fail when product price not found', async () => {
      const dto = {
        orderSku: 'ORDER-001',
        productSku: 'UNKNOWN-PRODUCT',
        quantity: 1,
      };

      const result = await addItemToOrder.execute(dto);

      expect(result.success).toBe(false);
      expect(result.error.constructor.name).toBe('NotFoundError');
    });
  });
});
