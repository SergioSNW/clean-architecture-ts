import { Order } from '../../domain/entities/Order.js';
import { SKU } from '../../domain/value-objects/SKU.js';
import { Result } from '../../shared/Result.js';
import { AppError } from '../errors.js';

export interface OrderRepository {
  save(order: Order): Promise<Result<void, AppError>>;
  findById(sku: SKU): Promise<Result<Order, AppError>>;
}
