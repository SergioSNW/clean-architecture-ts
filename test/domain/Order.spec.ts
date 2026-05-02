import { describe, it, expect, beforeEach } from 'vitest';
import { Order } from '../../src/domain/entities/Order.ts';
import { SKU } from '../../src/domain/value-objects/SKU.ts';
import { Money } from '../../src/domain/value-objects/Money.ts';
import { Quantity } from '../../src/domain/value-objects/Quantity.ts';
import { Currency } from '../../src/domain/value-objects/Currency.ts';

describe('Order', () => {
  let orderSku: SKU;
  let laptopSku: SKU;
  let mouseSku: SKU;
  let usd: Currency;

  beforeEach(() => {
    orderSku = new SKU('ORDER-001');
    laptopSku = new SKU('LAPTOP-001');
    mouseSku = new SKU('MOUSE-001');
    usd = new Currency('USD');
  });

  describe('constructor', () => {
    it('should create an order with the given SKU', () => {
      const order = new Order(orderSku);
      expect(order.sku.value).toBe('ORDER-001');
    });

    it('should emit OrderCreated event on creation', () => {
      const order = new Order(orderSku);
      expect(order.events).toHaveLength(1);
      expect(order.events[0].constructor.name).toBe('OrderCreated');
    });

    it('should start with empty items', () => {
      const order = new Order(orderSku);
      expect(order.items).toHaveLength(0);
    });
  });

  describe('addItem', () => {
    it('should add a new item to the order', () => {
      const order = new Order(orderSku);
      const money = new Money(999.99, usd);
      const quantity = new Quantity(1);

      order.addItem(laptopSku, quantity, money);

      expect(order.items).toHaveLength(1);
      expect(order.items[0].productSku.value).toBe('LAPTOP-001');
      expect(order.items[0].quantity.value).toBe(1);
      expect(order.items[0].unitPrice.amount).toBe(999.99);
    });

    it('should emit ItemAddedToOrder event when adding item', () => {
      const order = new Order(orderSku);
      const money = new Money(999.99, usd);
      const quantity = new Quantity(1);

      order.addItem(laptopSku, quantity, money);

      expect(order.events).toHaveLength(2);
      expect(order.events[1].constructor.name).toBe('ItemAddedToOrder');
    });

    it('should increase quantity when adding same product', () => {
      const order = new Order(orderSku);
      const money = new Money(999.99, usd);
      const quantity = new Quantity(1);

      order.addItem(laptopSku, quantity, money);
      order.addItem(laptopSku, new Quantity(2), money);

      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity.value).toBe(3);
    });

    it('should throw error when adding same product with different price', () => {
      const order = new Order(orderSku);
      const money1 = new Money(999.99, usd);
      const money2 = new Money(899.99, usd);
      const quantity = new Quantity(1);

      order.addItem(laptopSku, quantity, money1);

      expect(() => order.addItem(laptopSku, quantity, money2)).toThrow(
        'Cannot add item with different unit price',
      );
    });
  });

  describe('getTotalByCurrency', () => {
    it('should return empty map for order with no items', () => {
      const order = new Order(orderSku);
      const totals = order.getTotalByCurrency();
      expect(totals.size).toBe(0);
    });

    it('should calculate total for single currency', () => {
      const order = new Order(orderSku);
      order.addItem(laptopSku, new Quantity(1), new Money(999.99, usd));
      order.addItem(mouseSku, new Quantity(2), new Money(29.99, usd));

      const totals = order.getTotalByCurrency();
      expect(totals.size).toBe(1);
      expect(totals.get('USD')?.amount).toBe(1059.97);
    });

    it('should calculate correct total with quantity multiplication', () => {
      const order = new Order(orderSku);
      order.addItem(laptopSku, new Quantity(2), new Money(100, usd));

      const totals = order.getTotalByCurrency();
      expect(totals.get('USD')?.amount).toBe(200);
    });
  });

  describe('clearEvents', () => {
    it('should clear all events', () => {
      const order = new Order(orderSku);
      order.addItem(laptopSku, new Quantity(1), new Money(999.99, usd));

      expect(order.events).toHaveLength(2);

      order.clearEvents();

      expect(order.events).toHaveLength(0);
    });
  });
});
