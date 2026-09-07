/*
  Warnings:

  - A unique constraint covering the columns `[invite_token]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invite_token` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `invite_token` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `is_admin` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `orders_invite_token_key` ON `orders`(`invite_token`);
