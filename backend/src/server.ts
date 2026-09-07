import { app } from './app.js';
import { env } from './config/env.js';
import { startAutoReleaseTimeoutJob } from './jobs/autoReleaseTimeout.job.js';
import { startAutoRefundBeforeLockJob } from './jobs/autoRefundBeforeLock.job.js';

app.listen(env.port, () => {
  console.log(`Backend jalan di http://localhost:${env.port}`);

  // node-cron native — jalan di proses ini sendiri, portable di laptop mana pun
  startAutoReleaseTimeoutJob();
  startAutoRefundBeforeLockJob();
});
