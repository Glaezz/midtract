import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // upsert -- aman dijalankan berkali-kali (idempotent), tidak akan duplikat
  // kalau seed dijalankan ulang tanpa reset database.
  await prisma.ewalletChannel.upsert({
    where: { providerCode: 'DANA' },
    update: {},
    create: { providerCode: 'DANA', name: 'DANA', isActive: true },
  });

  // Disiapkan untuk masa depan (belum aktif) -- sesuai keputusan MVP: cuma
  // DANA yang dipakai sekarang, tapi struktur data sudah siap kalau nanti
  // OVO/GoPay/ShopeePay ditambahkan tanpa perlu migrasi skema baru.
  const inactiveChannels = [
    { providerCode: 'OVO', name: 'OVO' },
    { providerCode: 'GOPAY', name: 'GoPay' },
    { providerCode: 'SHOPEEPAY', name: 'ShopeePay' },
  ];

  for (const channel of inactiveChannels) {
    await prisma.ewalletChannel.upsert({
      where: { providerCode: channel.providerCode },
      update: {},
      create: { ...channel, isActive: false },
    });
  }

  console.log('Seed selesai: ewallet_channels terisi (DANA aktif, lainnya nonaktif).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
