-- Tambah kolom from_address/to_address ke onchain_events, dicatat oleh relayer
-- saat itu juga (snapshot), bukan diturunkan ulang saat baca -- lihat komentar
-- di schema.prisma model OnchainEvent.
ALTER TABLE `onchain_events`
  ADD COLUMN `from_address` VARCHAR(191) NULL,
  ADD COLUMN `to_address` VARCHAR(191) NULL;
