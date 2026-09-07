/*
  Warnings:

  - The primary key for the `ewallet_channels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `ewallet_channels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider_code]` on the table `ewallet_channels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `ewallet_channels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_code` to the `ewallet_channels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ewallet_channels` DROP PRIMARY KEY,
    DROP COLUMN `code`,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `provider_code` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `ewallet_channels_provider_code_key` ON `ewallet_channels`(`provider_code`);
