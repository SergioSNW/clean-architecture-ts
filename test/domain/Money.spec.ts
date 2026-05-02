import { describe, it, expect } from 'vitest';
import { Money } from '../../src/domain/value-objects/Money.ts';
import { Currency } from '../../src/domain/value-objects/Currency.ts';

describe('Money', () => {
  describe('constructor', () => {
    it('should create money with valid amount and currency', () => {
      const money = new Money(100.5, new Currency('USD'));
      expect(money.amount).toBe(100.5);
      expect(money.currency.code).toBe('USD');
    });

    it('should round amount to 2 decimal places', () => {
      const money = new Money(100.556, new Currency('USD'));
      expect(money.amount).toBe(100.56);
    });

    it('should throw error for negative amount', () => {
      expect(() => new Money(-10, new Currency('USD'))).toThrow(
        'Amount cannot be negative',
      );
    });

    it('should throw error for non-finite amount', () => {
      expect(() => new Money(Infinity, new Currency('USD'))).toThrow(
        'Amount must be a finite number',
      );
    });

    it('should normalize currency code to uppercase', () => {
      const money = new Money(100, new Currency('usd'));
      expect(money.currency.code).toBe('USD');
    });
  });

  describe('add', () => {
    it('should add two money values with same currency', () => {
      const money1 = new Money(50, new Currency('USD'));
      const money2 = new Money(30.25, new Currency('USD'));
      const result = money1.add(money2);
      expect(result.amount).toBe(80.25);
    });

    it('should throw error when adding different currencies', () => {
      const money1 = new Money(50, new Currency('USD'));
      const money2 = new Money(30, new Currency('EUR'));
      expect(() => money1.add(money2)).toThrow(
        'Cannot add money with different currencies',
      );
    });
  });

  describe('multiply', () => {
    it('should multiply money by factor', () => {
      const money = new Money(50, new Currency('USD'));
      const result = money.multiply(2);
      expect(result.amount).toBe(100);
    });

    it('should throw error for negative factor', () => {
      const money = new Money(50, new Currency('USD'));
      expect(() => money.multiply(-1)).toThrow('Factor cannot be negative');
    });
  });

  describe('equals', () => {
    it('should return true for equal money values', () => {
      const money1 = new Money(50, new Currency('USD'));
      const money2 = new Money(50, new Currency('USD'));
      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = new Money(50, new Currency('USD'));
      const money2 = new Money(51, new Currency('USD'));
      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const money1 = new Money(50, new Currency('USD'));
      const money2 = new Money(50, new Currency('EUR'));
      expect(money1.equals(money2)).toBe(false);
    });
  });
});
