import { Order } from '../../domain/entities/Order.js';
import { SKU } from '../../domain/value-objects/SKU.js';
import { Result, ok, fail } from '../../shared/Result.js';
import { UnitOfWork } from '../ports/UnitOfWork.js';
import { EventBus } from '../ports/EventBus.js';
import { CreateOrderDto } from '../dto/CreateOrderDTO.js';
import { AppError, ValidationError } from '../errors.js';

export class CreateOrderWithUoW {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly eventBus: EventBus,
  ) {}

  async execute(dto: CreateOrderDto): Promise<Result<void, AppError>> {
    try {
      const orderSku = new SKU(dto.orderSku);

      const result = await this.unitOfWork.run(async (repos) => {
        // Check if order already exists (skip this check for now as we're using UUIDs)
        // For simplicity, we'll generate a unique order each time
        // In a real scenario, you might want to check by a business identifier

        // Create new order
        const order = new Order(orderSku);

        // Save order within transaction
        const saveResult = await repos.orderRepository.save(order);
        if (!saveResult.success) {
          throw saveResult.error;
        }

        return order;
      });

      if (!result.success) {
        return fail(result.error);
      }

      // Publish events outside of transaction
      const order = result.data;
      const publishResult = await this.eventBus.publish(order.events);
      if (!publishResult.success) {
        return fail(publishResult.error);
      }

      return ok(undefined);
    } catch (error) {
      if (error instanceof AppError) {
        return fail(error);
      }
      if (error instanceof Error) {
        return fail(new ValidationError(error.message));
      }
      return fail(new ValidationError('Unknown validation error'));
    }
  }
}
