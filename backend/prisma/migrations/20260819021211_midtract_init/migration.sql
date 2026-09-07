-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `privy_did` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `wallet_address` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_privy_did_key`(`privy_did`),
    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_wallet_address_key`(`wallet_address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ewallet_channels` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_code` VARCHAR(191) NOT NULL,
    `seller_id` BIGINT NOT NULL,
    `buyer_id` BIGINT NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `product_description` VARCHAR(191) NULL,
    `amount_idr` BIGINT NOT NULL,
    `amount_stablecoin` DECIMAL(18, 6) NOT NULL,
    `stablecoin_rate_used` DECIMAL(18, 2) NOT NULL,
    `seller_payout_channel` VARCHAR(191) NOT NULL,
    `seller_payout_number` VARCHAR(191) NOT NULL,
    `buyer_payout_channel` VARCHAR(191) NULL,
    `buyer_payout_number` VARCHAR(191) NULL,
    `courier_name` VARCHAR(191) NULL,
    `courier_receipt_number` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING_PAYMENT',
    `tx_hash_lock` VARCHAR(191) NULL,
    `tx_hash_release` VARCHAR(191) NULL,
    `signature_deadline_at` DATETIME(3) NULL,
    `auto_release_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_order_code_key`(`order_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `status_from` VARCHAR(191) NULL,
    `status_to` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `actor_id` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'midtrans',
    `provider_transaction_id` VARCHAR(191) NOT NULL,
    `amount_idr` BIGINT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_provider_transaction_id_key`(`provider_transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payouts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'okeconnect',
    `provider_payout_id` VARCHAR(191) NULL,
    `recipient_channel` VARCHAR(191) NOT NULL,
    `recipient_number` VARCHAR(191) NOT NULL,
    `amount_idr` BIGINT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `disbursed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payouts_provider_payout_id_key`(`provider_payout_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `recipient_channel` VARCHAR(191) NOT NULL,
    `recipient_number` VARCHAR(191) NOT NULL,
    `amount_idr` BIGINT NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `trigger_type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `refunded_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `onchain_events` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `tx_hash` VARCHAR(191) NOT NULL,
    `block_number` BIGINT NULL,
    `amount_stablecoin` DECIMAL(18, 6) NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_logs` ADD CONSTRAINT `order_logs_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_logs` ADD CONSTRAINT `order_logs_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `onchain_events` ADD CONSTRAINT `onchain_events_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
