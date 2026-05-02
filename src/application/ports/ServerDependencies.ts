import { CreateOrder } from '../use-cases/CreateOrder.js';
import { AddItemToOrder } from '../use-cases/AddItemToOrder.js';
import { Logger } from './Logger.js';

export interface ServerDependencies {
  createOrderUseCase: CreateOrder;
  addItemToOrderUseCase: AddItemToOrder;
  logger: Logger;
}
