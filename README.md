# Clean Architecture TypeScript Project

This is a TypeScript project implementing clean architecture principles.

# Ordering Mircroservice

- **Domain**: Order, Price, SKU, Quantity, Domain Events
- **Application**: use cases CreateOrder, AddItemToOrder, Ports and DTOs.
- **Infrastructure**: repository InMemory, static pricing, event bus no-op.
- **HTTP**: minimal endpoints with Fastify.
- **Composition**: container.ts as composition-root.
- **Tests**: domain + acceptance of use cases.

## Behaviour

- `POST/orders` create an order
- `POST/orders/:orderId/items` adds a line(SKU + qty) with actual price.
- `Returns the total price of the order`
