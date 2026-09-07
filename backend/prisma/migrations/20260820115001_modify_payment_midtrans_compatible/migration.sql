/*
  Warnings:

  - A unique constraint covering the columns `[snap_token]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `gateway_fee_idr` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `platform_fee_idr` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `snap_token` VARCHAR(191) NULL,
    MODIFY `provider_transaction_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `payments_snap_token_key` ON `payments`(`snap_token`);
