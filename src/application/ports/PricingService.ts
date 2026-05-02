import { SKU } from '../../domain/value-objects/SKU.js';
import { Money } from '../../domain/value-objects/Money.js';
import { Result } from '../../shared/Result.js';
import { AppError } from '../errors.js';

export interface PricingService {
  getPrice(productSku: SKU): Promise<Result<Money, AppError>>;
}
