// Satu sumber kebenaran untuk enum status, dipakai FE (import relative) & BE (import relative).
// HARUS sinkron persis dengan nilai string di kolom orders.status pada database.

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'WAITING_FOR_SIGNATURE'
  | 'LOCKED_IN_ESCROW'
  | 'IN_TRANSIT'
  | 'DELIVERED_CONFIRMED_BY_BUYER'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'CANCELLED_REFUNDED'
  | 'EXPIRED';

export type OnchainEventType =
  | 'LOCKED'
  | 'RELEASED'
  | 'REFUNDED_ONCHAIN'
  | 'SWEPT_TO_POOL';
