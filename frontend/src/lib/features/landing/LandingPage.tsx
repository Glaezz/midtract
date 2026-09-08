import { Link } from 'react-router-dom';
import { ArrowRight, QrCode, LinkBreak, HandCoins, ShieldCheck, Hourglass, Coins, FileMagnifyingGlass, MagnifyingGlass, CaretDown, HeadCircuit } from '@phosphor-icons/react';
import { Container } from '$lib/components/atoms/Container';
import { Button } from '$lib/components/atoms/Button';
import { PublicTransactionTicker } from '$lib/components/organism/PublicTransactionTicker';

const STEPS = [
  {
    icon: LinkBreak,
    title: 'Buat rekber & bagikan link',
    text: 'Penjual membuat pesanan, lalu mengirim link undangan ke pembeli lewat chat mana pun.',
  },
  {
    icon: QrCode,
    title: 'Pembeli bayar, dana terkunci',
    text: 'Pembeli bayar QRIS. Dana otomatis diubah dan dikunci kontrak pintar, penjual belum bisa menyentuhnya.',
  },
  {
    icon: HandCoins,
    title: 'Barang diterima, dana dilepas',
    text: 'Setelah resi dikirim dan barang sampai, dana dilepas ke penjual secara otomatis.',
  },
];

const FEATURES = [
  {
    icon: QrCode,
    title: 'Inklusivitas Fiat',
    text: 'Pembeli bayar instan pakai QRIS (BCA, Gopay, OVO). Penjual terima payout otomatis ke E-Wallet/DANA tanpa harus paham crypto.',
  },
  {
    icon: ShieldCheck,
    title: 'Non-Custodial (Privy)',
    text: 'Login instan via Gmail/No. HP. Embedded wallet terbuat otomatis tanpa perlu menyimpan seed phrase manual.',
  },
  {
    icon: Hourglass,
    title: 'Berbasis Deadline',
    text: 'Sistem auto-release otomatis. Jika resi valid & batas waktu konfirmasi usai, dana cair mandiri ke penjual.',
  },
  {
    icon: Coins,
    title: 'Stablecoin USDC',
    text: 'Menggunakan USDC (1:1 USD) selama masa penguncian escrow untuk menghindari fluktuasi harga kripto.',
  },
  {
    icon: FileMagnifyingGlass,
    title: 'Terverifikasi Selamanya',
    text: 'Semua log transaksi & bukti EIP-712 terarsip permanen on-chain di Injective, anti manipulasi.',
  },
  {
    icon: HeadCircuit,
    title: 'AI Arbitrator',
    text: 'Sengketa dinilai transparan oleh konsensus Multi-Agent AI yang memeriksa resi kurir & bukti secara independen tanpa bias admin.',
  },
];

export function LandingPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl"
        />
        <Container width="wide" className="relative pt-20 pb-24 text-center sm:pt-30">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-surface px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
            <ShieldCheck size={14} weight="duotone" aria-hidden="true" />
            Rekber berbasis kontrak otomatis
          </span>

          <h1 className="mx-auto mt-6 max-w-2xl text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Transaksi online lebih aman, tanpa perlu ribet!
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Dana pembeli terkunci otomatis di kontrak pintar Web3. Barang diterima, baru dana dilepas ke
            penjual. Transparan di blockchain, sesederhana rekber biasa.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/dashboard" className="sm:w-auto w-full">
              <Button size="lg" fullWidth className="sm:w-auto">
                Mulai Rekber
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </Link>
            <a href="#cara-kerja" className="sm:w-auto w-full">
              <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                Lihat Cara Kerja
              </Button>
            </a>
          </div>
        </Container>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-200/60 bg-surface/50 py-8">
        <Container width="wide" className="flex flex-col items-center gap-5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Didukung dengan infrastruktur
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <a href="https://midtrans.com" target="_blank" rel="noreferrer" className="group flex items-center text-slate-800 hover:text-black opacity-40 hover:opacity-100 transition duration-300" title="Midtrans Payment Gateway">
  <svg className="h-6 w-auto block" viewBox="0 0 185 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <path d="M2.0078 24.1153C0.899057 24.1153 -0.000127003 23.2303 -0.000127003 22.139L-0.000127003 7.7615C-0.000127003 6.67025 0.899057 5.78525 2.0078 5.78525C3.11654 5.78525 4.01572 6.67025 4.01572 7.7615L4.01572 22.139C4.01572 23.2303 3.11654 24.1153 2.0078 24.1153Z" className="fill-current group-hover:fill-[#89C7E8] transition-colors duration-300" />
      <path d="M26.1021 24.1153C24.9934 24.1153 24.0942 23.2303 24.0942 22.139L24.0942 7.77275C24.0942 6.6815 24.9934 5.7965 26.1021 5.7965C27.2109 5.7965 28.1101 6.6815 28.1101 7.77275L28.1101 22.139C28.1101 23.2303 27.2109 24.1153 26.1021 24.1153Z" className="fill-current group-hover:fill-[#0BADDC] transition-colors duration-300" />
      <path d="M14.055 29.8809C12.9462 29.8809 12.047 28.9959 12.047 27.9046L12.047 2.00713C12.047 0.915875 12.9462 0.030875 14.055 0.030875C15.1637 0.030875 16.0629 0.915875 16.0629 2.00713L16.0629 27.9046C16.0629 28.9959 15.1637 29.8809 14.055 29.8809Z" className="fill-current group-hover:fill-[#307FC2] transition-colors duration-300" />
      <path d="M171.02 21.8413C170.779 21.6713 170.537 21.3313 170.537 20.8888C170.537 20.2775 171.055 19.7675 171.711 19.7675C171.952 19.7675 172.195 19.835 172.367 19.9725C174.196 21.195 176.096 21.8413 178.029 21.8413C180.171 21.8413 181.725 20.7538 181.725 19.0538L181.725 18.9863C181.725 17.2188 179.619 16.5388 177.271 15.8938C174.473 15.1113 171.365 14.16 171.365 10.9325L171.365 10.8638C171.365 7.83875 173.921 5.8325 177.442 5.8325C179.342 5.8325 181.415 6.41125 183.14 7.32875C183.487 7.53375 183.796 7.90625 183.796 8.41625C183.796 9.02875 183.278 9.53875 182.623 9.53875C182.38 9.53875 182.173 9.47 182.036 9.4025C180.516 8.5525 178.894 8.0425 177.374 8.0425C175.267 8.0425 173.921 9.13 173.921 10.5925L173.921 10.66C173.921 12.325 176.131 12.9713 178.513 13.6838C181.275 14.5 184.245 15.5538 184.245 18.715L184.245 18.7813C184.245 22.1138 181.449 24.05 177.892 24.05C175.544 24.05 172.954 23.2 171.02 21.8413Z" fill="currentColor" />
      <path d="M166.703 13.1615C166.703 9.20775 163.18 5.76525 158.933 5.76525C154.637 5.76525 151.153 9.194 151.153 13.4228L151.153 22.479C151.153 23.2603 151.766 23.8628 152.559 23.8628C153.354 23.8628 153.931 23.2603 153.931 22.479L153.929 18.4115L153.929 13.1603C153.929 10.444 156.167 8.2415 158.927 8.2415C161.688 8.2415 163.926 10.444 163.926 13.1603L163.926 18.4203L163.926 22.479C163.926 23.2603 164.538 23.8628 165.296 23.8628C166.09 23.8628 166.703 23.2603 166.703 22.479C166.703 22.479 166.729 14.0128 166.703 13.1615Z" fill="currentColor" />
      <path d="M137.75 21.7345C135.332 21.7345 133.426 20.7195 133.426 18.5108L133.426 18.442C133.426 16.2333 135.29 14.8058 138.639 14.8058C140.815 14.8058 143.886 15.492 143.887 15.5533L143.887 15.557C143.887 18.7783 140.83 21.7345 137.75 21.7345Z M146.408 12.9708L146.403 12.9708C146.161 9.1995 142.749 5.9995 138.656 5.9995L137.465 5.9995C136.77 5.9995 136.207 6.55325 136.207 7.237C136.207 7.92075 136.77 8.47575 137.465 8.47575L138.65 8.47575C141.411 8.47575 143.854 10.6783 143.854 13.3945L143.854 13.6158C142.265 13.1745 140.642 12.8683 138.364 12.8683C133.84 12.8683 130.732 14.8395 130.732 18.5445L130.732 18.612C130.732 22.2158 133.959 24.0845 137.274 24.0845C140.284 24.0845 142.659 22.5658 143.887 20.6095L143.887 22.6233C143.887 23.3083 144.452 23.8633 145.148 23.8633C145.844 23.8633 146.409 23.3083 146.409 22.6233L146.408 12.9708Z" fill="currentColor" />
      <path d="M130.23 7.234C130.23 6.55025 129.666 5.99525 128.971 5.99525L128.113 5.99525L128.111 5.99525C123.815 5.99525 120.331 9.424 120.331 13.6515L120.331 22.479C120.331 23.2603 120.944 23.8628 121.737 23.8628C122.532 23.8628 123.109 23.2603 123.109 22.479L123.107 18.4115L123.107 13.3903C123.107 10.674 125.345 8.4715 128.105 8.4715L128.113 8.4715L128.113 8.47275L128.971 8.47275C129.666 8.47275 130.23 7.91775 130.23 7.234Z" fill="currentColor" />
      <path d="M115.918 7.17088C115.918 6.53213 115.392 6.01463 114.743 6.01463L110.082 6.01463L110.082 1.40213C110.082 0.677125 109.481 0.010875 108.746 0.005875C107.98 -0.000375 107.423 0.613375 107.423 1.33088L107.423 19.0546C107.423 22.6221 109.597 24.0159 112.463 24.0159C113.5 24.0159 114.329 23.8459 115.088 23.5409C115.537 23.3709 115.848 22.9971 115.848 22.5209C115.848 21.9084 115.33 21.3996 114.709 21.3996C114.502 21.3996 114.018 21.6371 113.086 21.6371C111.29 21.6371 110.082 20.8546 110.082 18.7146L110.082 8.32713L114.743 8.32713C115.392 8.32713 115.918 7.80963 115.918 7.17088Z" fill="currentColor" />
      <path d="M101.928 22.555C101.928 23.3025 101.342 23.88 100.616 23.88C99.857 23.88 99.2689 23.3025 99.2689 22.555L99.2689 20.67C97.8186 22.7775 95.7128 24.0838 92.4323 24.0838C88.1511 24.0838 83.9028 20.7538 83.9028 14.9763L83.9028 14.9075C83.9028 9.165 88.1511 5.76625 92.4323 5.76625C95.7471 5.76625 97.8884 7.03875 99.2689 9.01L99.2689 1.32625C99.2689 0.57875 99.8214 0 100.582 0C101.342 0 101.928 0.57875 101.928 1.32625L101.928 22.555Z M86.6321 14.8738L86.6321 14.9425C86.6321 19.0888 89.5659 21.74 92.9162 21.74C96.231 21.74 99.3731 18.9863 99.3731 14.9425L99.3731 14.8738C99.3731 10.83 96.231 8.11125 92.9162 8.11125C89.4617 8.11125 86.6321 10.6263 86.6321 14.8738Z" fill="currentColor" />
      <path d="M76.7949 7.0785C76.7949 6.36475 77.3817 5.7535 78.1069 5.7535C78.8663 5.7535 79.4544 6.331 79.4544 7.0785L79.4544 22.5548C79.4544 23.3035 78.9006 23.8798 78.1411 23.8798C77.3817 23.8798 76.7949 23.3035 76.7949 22.5548L76.7949 7.0785Z" fill="currentColor" />
      <path d="M63.8407 5.75363C61.2955 5.75363 59.0501 7.01363 57.7077 8.93113C56.3729 7.02238 54.1541 5.76613 51.6179 5.76613C47.5068 5.76613 44.1729 9.04738 44.1729 13.0936L44.1729 22.5549C44.1729 23.3024 44.7584 23.8799 45.5192 23.8799C46.2787 23.8799 46.8324 23.3024 46.8324 22.5549L46.8298 12.8436C46.8298 10.2424 48.9711 8.13613 51.6141 8.13613C54.2545 8.13613 56.397 10.2424 56.397 12.8436L56.3957 21.4711L56.3957 21.4749C56.3957 22.1974 56.9901 22.7836 57.7255 22.7836C58.4596 22.7836 59.0552 22.1974 59.0552 21.4749L59.0514 12.8311C59.0514 10.2311 61.1939 8.12363 63.8356 8.12363C66.4773 8.12363 68.6186 10.2311 68.6186 12.8311L68.6186 22.5424C68.6186 23.2911 69.2053 23.8674 69.9305 23.8674C70.69 23.8674 71.278 23.2911 71.278 22.5424L71.2856 13.0936C71.2856 8.91988 67.7816 5.75363 63.8407 5.75363Z" fill="currentColor" />
    </g>
  </svg>
</a>

            <a href="https://injective.com" target="_blank" rel="noreferrer" className="group flex items-center text-slate-800 hover:text-brand-600 opacity-40 hover:opacity-100 transition duration-300" title="Injective Network">
      <div className="flex items-center gap-2.5 h-7">
        <svg className="h-7 w-auto" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M20.57 0.408203L20.468 0.612203C24.004 2.1422 26.01 5.3042 26.01 8.7722C26.01 12.5122 23.562 15.9122 18.802 18.8022L18.02 19.2782C14.45 21.4542 12.648 23.9022 12.648 26.8602C12.648 30.6682 15.64 33.4562 19.754 33.4562C26.35 33.4562 34 26.4182 34 17.0342C34 15.5042 33.796 14.0082 33.422 12.5802L33.184 12.6482C33.286 13.4302 33.32 14.0082 33.32 14.5522C33.32 20.0942 30.192 24.8542 24.956 28.0162L24.446 28.3222C23.324 28.9682 22.372 29.3422 21.42 29.3422C20.162 29.3422 19.21 28.5262 19.21 27.3362C19.21 26.3162 19.89 25.2962 22.1 24.0042L22.746 23.6302C27.642 20.7742 30.362 16.7622 30.362 12.3082C30.362 6.6642 26.146 2.0062 20.57 0.408203ZM13.43 33.6262L13.532 33.4222C9.996 31.8922 7.99 28.7302 7.99 25.2622C7.99 21.5222 10.438 18.1222 15.198 15.2322L15.98 14.7562C19.55 12.5802 21.352 10.1322 21.352 7.1742C21.352 3.3662 18.36 0.578203 14.246 0.578203C7.65 0.578203 0 7.6162 0 17.0002C0 18.5302 0.204 20.0262 0.578 21.4542L0.816 21.3862C0.714 20.6042 0.68 20.0262 0.68 19.4822C0.68 13.9402 3.808 9.1802 9.044 6.0182L9.554 5.7122C10.676 5.0662 11.628 4.6922 12.58 4.6922C13.838 4.6922 14.79 5.5082 14.79 6.6982C14.79 7.7182 14.11 8.7382 11.9 10.0302L11.254 10.4042C6.358 13.2602 3.638 17.2722 3.638 21.7262C3.638 27.3702 7.854 32.0282 13.43 33.6262Z" />
        </svg>
        <svg className="h-5 w-auto" viewBox="0 0 119 29" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_65_24267)">
            <path fill="currentColor" d="M0 20.685H0.491142C2.25348 20.685 2.77351 20.1649 2.77351 18.1137V6.44184C2.77351 4.3906 2.25348 3.87057 0.491142 3.87057H0V2.16602H9.10058V3.87057H8.63833C6.87599 3.87057 6.35596 4.3906 6.35596 6.44184V18.1137C6.35596 20.1649 6.87599 20.685 8.63833 20.685H9.10058V22.3895H0V20.685Z" />
            <path fill="currentColor" d="M15.5428 7.62606H16.3517V10.1973H16.3806C17.4207 8.49278 19.183 7.42383 21.4943 7.42383C24.1522 7.42383 26.0879 8.89725 26.0879 12.9708V18.489C26.0879 20.3669 26.5212 20.8291 27.9947 20.8291H28.3991V22.3892H20.772V20.8291H21.1476C22.4765 20.8291 22.8521 20.3669 22.8521 18.489V12.9708C22.8521 10.7174 21.4654 9.93732 19.9342 9.93732C18.2296 9.93732 16.3228 11.1507 16.3228 14.4732V18.489C16.3228 20.3669 16.7273 20.8291 18.0274 20.8291H18.4029V22.3892H10.8047V20.8291H11.1803C12.6537 20.8291 13.0871 20.3669 13.0871 18.489V10.9196L11.0069 10.284V9.30172L15.5428 7.62606Z" />
            <path fill="currentColor" d="M31.3453 21.8105V10.9187L29.2652 10.2831V9.30084L33.8299 7.62518H34.5811V20.3949C34.5811 24.4396 32.3276 27.1264 27.7918 28.022L27.7051 27.6753C29.4963 26.6353 31.3453 24.8152 31.3453 21.8105ZM30.7675 3.06045C30.7675 1.73147 31.7787 0.691406 33.0788 0.691406C34.3788 0.691406 35.39 1.73147 35.4189 3.06045C35.4189 4.36053 34.4077 5.3717 33.1076 5.3717C31.8076 5.3717 30.7675 4.36053 30.7675 3.06045Z" />
            <path fill="currentColor" d="M45.0972 7.36523C48.8241 7.36523 51.1354 9.82095 51.1354 13.6056V13.8079H40.8792C40.908 17.5925 42.8148 19.7882 46.2528 19.7882C48.9108 19.7882 50.1531 18.4593 50.8753 17.1592L51.3665 17.3036C50.7309 20.106 48.6508 22.7929 44.6927 22.7929C40.3013 22.7929 37.7012 19.4704 37.7012 15.2813C37.7012 10.7743 40.6769 7.36523 45.0972 7.36523ZM47.6685 12.3344C47.524 10.1387 46.484 8.95422 44.6061 8.95422C43.1037 8.95422 41.4281 9.67649 40.9947 12.3344H47.6685Z" />
            <path fill="currentColor" d="M53.5332 15.5991C53.5332 10.8032 57.4623 7.36523 62.316 7.36523C64.0205 7.36523 65.4362 7.7986 66.4474 8.23196L66.4762 12.7389L65.6384 12.8545L63.2405 8.98311C62.8071 8.86755 62.3738 8.80977 61.9693 8.80977C59.6291 8.80977 56.7112 10.5721 56.7112 14.3568C56.7112 17.4481 58.5313 19.8171 61.9115 19.8171C64.5117 19.8171 65.7829 18.4593 66.534 17.1592L67.0252 17.3325C66.3896 20.106 64.3094 22.7929 60.4092 22.7929C56.1045 22.7929 53.5332 19.4704 53.5332 15.5991Z" />
            <path fill="currentColor" d="M69.5684 18.0563V8.17564L71.9374 4.27539H72.833V7.94451H77.3977V9.88019H72.833V17.334C72.833 19.2986 73.642 20.3097 75.2309 20.3097C75.8954 20.3097 76.8488 20.1364 77.8022 19.0674L78.1778 19.2986C77.2244 21.4365 75.6932 22.6788 73.5264 22.6788C71.2151 22.6788 69.5684 21.1476 69.5684 18.0563Z" />
            <path fill="currentColor" d="M79.4492 20.8282H79.8537C81.3271 20.8282 81.7605 20.366 81.7605 18.4881V10.9476L79.6803 10.2831V9.30084L84.3606 7.59629H84.9962V18.4881C84.9962 20.366 85.4296 20.8282 86.903 20.8282H87.2786V22.3883H79.4492V20.8282ZM81.0093 3.06045C81.0093 1.73147 82.0205 0.691406 83.3206 0.691406C84.6207 0.691406 85.6318 1.73147 85.6607 3.06045C85.6896 4.36053 84.6495 5.3717 83.3206 5.3717C81.9916 5.3717 81.0093 4.36053 81.0093 3.06045Z" />
            <path fill="currentColor" d="M88.2315 9.50346H87.8848V7.94336H95.6853V9.50346H95.2808C93.8074 9.50346 93.4029 9.96571 94.1541 11.6703L97.1009 18.3151L99.9611 11.6703C100.683 9.96571 100.279 9.50346 98.8055 9.50346H98.4299V7.94336H104.815V9.50346H104.468C103.081 9.50346 102.648 9.96571 101.897 11.6703L97.2165 22.4754H95.483L90.6294 11.6703C89.8493 9.96571 89.4738 9.50346 88.2315 9.50346Z" />
            <path fill="currentColor" d="M112.73 7.36523C116.457 7.36523 118.768 9.82095 118.768 13.6056V13.8079H108.512C108.541 17.5925 110.448 19.7882 113.886 19.7882C116.544 19.7882 117.786 18.4593 118.508 17.1592L118.999 17.3036C118.364 20.106 116.284 22.7929 112.326 22.7929C107.934 22.7929 105.334 19.4704 105.334 15.2813C105.334 10.7743 108.31 7.36523 112.73 7.36523ZM115.301 12.3344C115.157 10.1387 114.117 8.95422 112.239 8.95422C110.737 8.95422 109.061 9.67649 108.628 12.3344H115.301Z" />
          </g>
          <defs>
            <clipPath id="clip0_65_24267">
              <rect width="119" height="27.3306" fill="white" transform="translate(0 0.691406)" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </a>
    <a href="https://privy.io" target="_blank" rel="noreferrer" className="group flex items-center text-slate-800 hover:text-black opacity-40 hover:opacity-100 transition duration-300" title="Privy Auth">
      <svg className="h-5 w-auto" viewBox="0 0 220 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path fill="currentColor" d="M 157.546 25.557 L 156.893 25.557 L 148.396 1 L 138.444 1 L 138.444 2.015 L 150.43 36.308 L 163.647 36.308 L 175.636 2.015 L 175.636 1 L 166.117 1 L 157.542 25.556 L 157.546 25.556 Z" />
          <path fill="currentColor" d="M 135.867 1 L 125.972 1 L 125.972 36.304 L 135.867 36.304 L 135.867 1.001 Z" />
          <path fill="currentColor" d="M 205.067 0.952 L 214.586 0.952 L 214.586 1.975 C 214.586 1.975 201.496 39.432 201.235 40.168 C 199.291 45.687 195.283 47.416 190.137 47.416 L 178.088 47.416 L 178.088 39.238 L 190.417 39.238 L 177.397 1.982 L 177.397 0.96 L 187.349 0.96 L 195.846 25.52 L 196.499 25.52 L 205.074 0.956 L 205.067 0.956 Z M 90.569 18.609 C 90.569 29.514 84.456 37.212 75.52 37.212 C 70.609 37.212 66.661 34.088 64.97 32.039 C 64.903 31.961 64.836 31.864 64.769 31.771 L 64.153 31.771 L 64.153 47.405 L 54.13 47.405 L 54.13 0.997 L 63.564 0.997 L 63.564 6.575 L 64.172 6.575 C 66.795 2.284 71.001 0 75.501 0 C 84.154 0 90.569 7.706 90.569 18.609 Z M 80.549 18.613 C 80.549 11.369 77.172 7.668 72.508 7.668 C 67.844 7.668 64.623 11.291 64.623 18.613 C 64.623 25.936 67.844 29.558 72.508 29.558 C 77.251 29.558 80.549 25.858 80.549 18.613 Z M 115.428 0.955 L 122.772 0.955 L 122.772 9.718 L 112.271 9.718 C 107.406 9.718 106.085 12.689 106.085 17.539 L 106.085 36.268 L 96.062 36.268 L 96.062 17.041 L 96.024 17.041 L 96.024 10.302 C 95.89 9.439 95.371 9.067 94.315 9.067 L 91.114 9.067 L 91.114 0.96 L 105.461 0.96 L 105.461 6.575 L 106.058 6.575 C 107.801 1.729 110.783 0.956 115.428 0.956 Z" />
          <path fill="currentColor" d="M 18.658 37.189 C 28.96 37.189 37.316 28.862 37.316 18.594 C 37.316 8.326 28.96 0 18.658 0 C 8.355 -0.001 0 8.326 0 18.594 C 0 28.861 8.355 37.188 18.658 37.188 Z M 18.658 48 C 25.699 48 31.408 46.803 31.408 45.333 C 31.408 43.865 25.703 42.667 18.658 42.667 C 11.612 42.667 5.907 43.865 5.907 45.333 C 5.907 46.803 11.612 48 18.658 48 Z" />
        </g>
      </svg>
    </a>
     {/* okeconnect */}
    <a href="https://okeconnect.com" target="_blank" rel="noreferrer" className="group flex items-center text-slate-800 hover:text-teal-600 opacity-40 hover:opacity-100 transition duration-300" title="OkeConnect Disbursement Gateway">
  <svg className="h-10 w-auto block" viewBox="0 0 400 106" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" fillRule="evenodd" d="M 43 21 C 41.9 22.1, 41 23.675, 41 24.5 C 41 25.325, 40.5399 26, 39.9777 26 C 37.9228 26, 29.7562 34.5476, 27.4355 39.1272 C 26.1235 41.7163, 24.7459 45.7844, 24.3742 48.1674 C 24.0025 50.5503, 22.8662 53.5732, 21.8492 54.8849 C 18.7645 58.8631, 20.2874 64.048, 25.1297 66.0537 C 26.7084 66.7076, 28 67.6368, 28 68.1184 C 28 69.7933, 35.3583 77.1257, 39.439 79.5171 C 41.6975 80.8407, 46.0102 82.4415, 49.0227 83.0745 C 52.0352 83.7074, 55.2104 84.8496, 56.0787 85.6127 C 58.6609 87.8818, 62.8304 87.2852, 65.6027 84.25 C 68.5069 81.0704, 69.8632 79.7772, 75.2373 75.0635 C 79.8121 71.0509, 83.6701 63.9679, 84.6226 57.8326 C 84.9926 55.4497, 85.9039 52.6124, 86.6477 51.5275 C 89.2768 47.6927, 87.1555 40, 83.469 40 C 82.6893 40, 81.4019 38.7625, 80.6081 37.25 C 77.0101 30.3944, 67.575 24.0727, 58.5 22.4371 C 56.3 22.0406, 53.6124 21.1051, 52.5275 20.3581 C 49.6771 18.3955, 45.3103 18.6897, 43 21 M 49.6642 25.5672 C 50.4976 27.7392, 48.3817 29.7817, 46.8672 28.2672 C 45.5872 26.9872, 46.3802 24, 48 24 C 48.5845 24, 49.3334 24.7052, 49.6642 25.5672 M 62.3488 30.2226 C 68.1577 31.963, 75.4879 39.1611, 74.5484 42.2023 C 72.8035 47.8503, 72.8816 48.7058, 75.417 51.7189 C 76.8376 53.4073, 78 55.8192, 78 57.0786 C 78 63.2168, 68.7481 74.9769, 65.141 73.4237 C 60.9267 71.6091, 58.3053 71.8722, 55.2858 74.4129 C 51.5268 77.5759, 50.8082 77.5896, 44.4291 74.6192 C 38.1557 71.698, 32.6639 65.4965, 34.0526 62.9017 C 35.6914 59.8396, 35.0988 55.9965, 32.6342 53.7023 C 30.4071 51.6291, 30.3384 51.2256, 31.4617 46.8206 C 33.4423 39.0539, 41.5731 30.1731, 44.2513 32.8513 C 46.2723 34.8723, 50.9951 34.1784, 53.3257 31.5181 C 55.8186 28.6724, 56.7354 28.5408, 62.3488 30.2226 M 128.25 29.6623 C 126.858 30.224, 126.408 64.5543, 127.765 66.6152 C 128.97 68.4438, 132.781 69.1878, 134.962 68.0202 C 136.555 67.1679, 137 65.9343, 137 62.3738 L 137 57.818 142.287 63.409 C 147.814 69.2541, 149.811 70.0457, 152.429 67.4286 C 154.946 64.9111, 154.299 62.8725, 149.407 57.9059 L 144.815 53.2431 148.455 50.4664 C 154.679 45.7195, 155.27 42.3553, 150.281 40.082 C 147.842 38.9711, 147.321 39.239, 142.336 44.1624 L 137 49.4317 137 41.2158 C 137 30.8968, 134.236 27.247, 128.25 29.6623 M 359.75 33.6893 C 358.186 34.0981, 358 35.6719, 358 48.5176 C 358 62.0875, 358.129 63.0381, 360.309 65.5727 C 363.318 69.0714, 371.652 70.2048, 374.372 67.4852 C 376.89 64.9669, 376.11 61.5193, 373 61.421 C 368.037 61.2643, 368 61.217, 368 55.0604 L 368 49.1207 371.75 48.8104 C 375.181 48.5264, 375.5 48.2448, 375.5 45.5 C 375.5 42.7031, 375.222 42.4797, 371.398 42.1997 C 367.692 41.9284, 367.34 41.6729, 367.746 39.5476 C 368.035 38.0386, 367.444 36.4439, 366.098 35.0979 C 364.014 33.0138, 363.106 32.8123, 359.75 33.6893 M 49.0005 37.1235 C 33.7701 43.1966, 36.367 66.1107, 52.6663 69.4696 C 60.2766 71.038, 71.5535 63.467, 70.8098 57.2888 C 70.1698 51.9728, 60.6798 52.5974, 59.2672 58.0485 L 58.4891 61.0515 53.3157 57.7758 L 48.1423 54.5 51.3122 49.25 C 54.475 44.0117, 56 42.7569, 56 45.393 C 56 48.4337, 62.6536 48.9108, 66.1033 46.1175 C 72.6944 40.7803, 58.5214 33.327, 49.0005 37.1235 M 102 40.7516 C 98.1697 42.665, 94 49.5703, 94 54 C 94 61.8419, 101.395 68.9969, 109.5 68.9969 C 118.673 68.9969, 124.467 63.1914, 124.467 54 C 124.467 44.8086, 118.673 39.0031, 109.5 39.0031 C 107.3 39.0031, 103.925 39.7899, 102 40.7516 M 161.062 40.8273 C 151.237 46.0965, 151.845 62.0343, 162.071 67.2484 C 168.406 70.4788, 181.02 68.513, 180.985 64.301 C 180.956 60.8849, 179.573 59.8315, 176.602 60.9612 C 171.275 62.9864, 164 61.6627, 164 58.6684 C 164 57.8552, 166.857 56.9907, 172.045 56.2346 C 181.73 54.8231, 182 54.6781, 182 50.8913 C 182 41.3818, 170.413 35.8123, 161.062 40.8273 M 191.415 40.4214 C 180.696 45.0886, 180.562 62.1764, 191.207 67.0076 C 199.485 70.7649, 209.249 68.5109, 207.573 63.2294 C 206.986 61.3811, 206.219 61.112, 202.051 61.2915 C 195.796 61.561, 193 59.2834, 193 53.9176 C 193 48.5115, 196.818 45.5956, 202.735 46.4829 C 206.79 47.0911, 207 46.9993, 207 44.618 C 207 39.5848, 198.558 37.3115, 191.415 40.4214 M 214.898 41.2699 C 205.363 47.6395, 206.017 62.1219, 216.071 67.2484 C 222.96 70.7611, 232.477 68.5443, 236.114 62.5800 C 237.351 60.5521, 237.993 57.6212, 237.993 54 C 237.993 50.3788, 237.351 47.4479, 236.114 45.4200 C 232.246 39.076, 221.367 36.9481, 214.898 41.2699 M 247.021 40.116 C 241.417 42.3518, 241 43.4297, 241 55.6797 C 241 66.7514, 241.063 67.0734, 243.393 67.9592 C 244.709 68.4595, 246.734 68.6209, 247.893 68.3178 C 249.865 67.8021, 250 67.1017, 250 57.4024 L 250 47.0381 252.655 46.3718 C 257.574 45.1371, 258.472 46.7504, 258.787 57.3948 C 259.065 66.7844, 259.152 67.1073, 261.669 68.0642 C 267.329 70.2162, 268 69.0037, 268 56.6212 C 268 44.4063, 267.089 42.125, 261.339 39.9387 C 258.179 38.7374, 250.229 38.8359, 247.021 40.116 M 278.021 40.116 C 272.417 42.3518, 272 43.4297, 272 55.6797 C 272 67.0395, 272.002 67.0504, 274.632 68.0502 C 280.202 70.1679, 281 68.8971, 281 57.9112 C 281 48.184, 281.059 47.9304, 283.578 46.7827 C 288.143 44.7028, 289.464 46.5915, 289.752 55.6051 C 289.89 59.9473, 290.223 64.4587, 290.491 65.6305 C 291.035 68.0085, 294.259 69.224, 297.72 68.3555 C 299.892 67.8104, 300 67.3351, 300 58.3595 C 300 46.7116, 298.494 42.5223, 293.568 40.464 C 289.608 38.8095, 281.737 38.6334, 278.021 40.116 M 309.077 40.7657 C 299.204 46.2142, 299.769 62.0984, 310.02 67.2484 C 316.215 70.361, 327.248 68.9432, 328.542 64.8684 C 329.498 61.8563, 327.364 59.9111, 324.357 61.0542 C 319.257 62.9934, 312 61.5923, 312 58.6684 C 312 57.8552, 314.857 56.9907, 320.045 56.2346 C 329.86 54.804, 330 54.7226, 330 50.4263 C 330 47.9036, 329.1 45.9881, 326.665 43.3313 C 322.458 38.7404, 314.778 37.6201, 309.077 40.7657 M 339.071 40.7516 C 326.308 47.2597, 329.439 65.9039, 343.75 68.6084 C 350.837 69.9478, 357.003 66.7777, 355.406 62.6156 C 354.975 61.4929, 353.542 61.1412, 350.015 61.2931 C 343.798 61.5608, 341 59.2716, 341 53.9176 C 341 48.5025, 344.716 45.6849, 350.679 46.5791 C 354.816 47.1995, 355 47.1182, 355 44.6702 C 355 39.3572, 346.1 37.1676, 339.071 40.7516 M 82.7503 46.7495 C 83.2971 48.3916, 80.1638 49.5638, 78.8199 48.2199 C 78.2448 47.6448, 78.092 46.6601, 78.4804 46.0318 C 79.3639 44.6021, 82.1937 45.0778, 82.7503 46.7495 M 113 48 C 117.021 52.0208, 114.526 62, 109.5 62 C 106.618 62, 104 58.1916, 104 54 C 104 49.8084, 106.618 46, 109.5 46 C 110.325 46, 111.9 46.9, 113 48 M 172.655 47.5431 C 173.46 49.641, 173.051 49.8941, 167.671 50.6316 C 162.804 51.2988, 161.445 49.9553, 164.2 47.2 C 165.961 45.4395, 171.941 45.6822, 172.655 47.5431 M 226.427 47.5699 C 228.454 49.5966, 229.379 53.3555, 228.607 56.4301 C 226.486 64.8797, 218 62.7985, 218 53.8287 C 218 47.2186, 222.634 43.7769, 226.427 47.5699 M 320.02 47.5242 C 321.686 49.5318, 321.209 49.8725, 315.671 50.6316 C 311.981 51.1374, 311 50.9703, 311 49.8359 C 311 46.1855, 317.522 44.514, 320.02 47.5242 M 29.5539 58.0871 C 30.4948 59.6096, 28.4514 61.3872, 26.5841 60.6706 C 25.6857 60.3259, 25.2819 59.429, 25.6238 58.5379 C 26.3063 56.7593, 28.5726 56.4994, 29.5539 58.0871 M 61.6642 78.5672 C 62.4976 80.7392, 60.3817 82.7817, 58.8672 81.2672 C 57.5872 79.9872, 58.3802 77, 60 77 C 60.5845 77, 61.3334 77.7052, 61.6642 78.5672" />
  </svg>
</a>

    <a href="https://www.circle.com/usdc" target="_blank" rel="noreferrer" className="group flex items-center text-slate-800 hover:text-black opacity-40 hover:opacity-100 transition duration-300" title="USD Coin">
      <div className="flex items-center gap-1 h-7">
        <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" alt="USDC" className="h-6 w-auto grayscale group-hover:grayscale-0 transition" />
        <span className="font-extrabold text-xl tracking-wide font-sans">
          USDC
        </span>
      </div>
    </a>
          </div>
        </Container>
      </section>

      {/* Fitur Utama */}
      <section id="fitur" className="py-16 bg-surface border-y border-slate-200/60">
        <Container width="wide" className="space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-950">
              Fitur Utama Midtract
            </h2>
            <p className="text-sm text-slate-500">
              Kombinasi kemudahan transaksi harian dengan standar keamanan protokol kriptografi.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="p-6 rounded-card bg-canvas border border-slate-200/70 space-y-4 hover:border-brand-500/30 transition group">
                <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={22} weight="duotone" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-brand-900 text-base">{title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Cara Kerja */}
      <Container width="wide" id="cara-kerja" className="pt-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Cara kerja Midtract
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-slate-500 sm:text-base">
          Tiga langkah untuk transaksi online yang nyaman di kedua belah pihak.
        </p>

        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="relative rounded-card border border-slate-200/80 bg-surface p-6 shadow-card"
            >
              <span
                className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-sm shadow-brand-600/30"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={22} weight="duotone" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </Container>

      {/* Keamanan */}
      <section id="keamanan" className="py-16">
        <Container width="wide">
          <div className="bg-brand-900 text-white rounded-2xl p-8 md:p-12 shadow-xl space-y-8 relative overflow-hidden">
            <div className="max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-brand-800 text-brand-100 border border-brand-700">
                Open &amp; Auditable
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Transparansi Keamanan Tingkat Tinggi
              </h2>
              <p className="text-sm text-brand-100 leading-relaxed">
                Midtract dirancang dengan keamanan dan transparansi sebagai prioritas utama. Semua keputusan rilis/refund tunduk pada kode Smart Contract.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2 border-l-2 border-brand-500 pl-4">
                <h4 className="font-bold text-white text-sm">Tanpa Wallet Custody</h4>
                <p className="text-xs text-brand-100">Kunci privat dienkripsi via Privy TEE (Trusted Execution Environment).</p>
              </div>
              <div className="space-y-2 border-l-2 border-brand-500 pl-4">
                <h4 className="font-bold text-white text-sm">Source Available di GitHub</h4>
                <p className="text-xs text-brand-100">Seluruh kode frontend, backend, dan smart contract dapat diperiksa publik.</p>
              </div>
              <div className="space-y-2 border-l-2 border-brand-500 pl-4">
                <h4 className="font-bold text-white text-sm">Verifikasi On-Chain</h4>
                <p className="text-xs text-brand-100">Status kunci escrow dapat diverifikasi langsung di Injective Block Explorer.</p>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-brand-800">
              <a href="https://github.com/glaezz/midtract" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-brand-950 hover:bg-brand-50 transition flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span>Lihat Kode di GitHub</span>
              </a>
              <a href={`https://testnet.blockscout.injective.network/address/${import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-800 text-brand-100 hover:bg-brand-700 transition flex items-center gap-2 border border-brand-700">
                <MagnifyingGlass size={16} weight="duotone" aria-hidden="true" />
                <span>Verifikasi di Injscan</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Ticker transparansi */}
      <Container width="wide" className="pt-16">
        <PublicTransactionTicker />
      </Container>

      {/* FAQ */}
      <Container width="wide" className="pt-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-950">
              Pertanyaan Sering Diajukan (FAQ)
            </h2>
            <p className="text-sm text-slate-500">
              Segala hal yang perlu kamu ketahui tentang penggunaan Midtract.
            </p>
          </div>
          <div className="space-y-4">
            <details className="group p-5 rounded-xl bg-surface shadow-card border border-slate-200/80 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-sm text-brand-900 cursor-pointer">
                <span>Apakah saya harus mengerti Web3 / Crypto untuk pakai Midtract?</span>
                <span className="transition group-open:rotate-180">
                  <CaretDown size={16} weight="bold" aria-hidden="true" />
                </span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Tidak perlu sama sekali. Pembeli membayar menggunakan QRIS (Gopay/OVO/ShopeePay/BCA), dan penjual menerima dana pencairan langsung ke saldo DANA/Transfer Bank. Seluruh konversi Web3 berjalan otomatis di latar belakang.
              </p>
            </details>
            <details className="group p-5 rounded-xl bg-surface shadow-card border border-slate-200/80 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-sm text-brand-900 cursor-pointer">
                <span>Bagaimana jika penjual tidak mengirimkan barang?</span>
                <span className="transition group-open:rotate-180">
                  <CaretDown size={16} weight="bold" aria-hidden="true" />
                </span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Dana tetap terkunci aman di Smart Contract. Jika penjual melampaui batas waktu pengiriman (deadline) tanpa memasukkan nomor resi yang valid, pembeli berhak mengajukan refund penuh.
              </p>
            </details>
            <details className="group p-5 rounded-xl bg-surface shadow-card border border-slate-200/80 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-sm text-brand-900 cursor-pointer">
                <span>Apakah Midtract bisa mengambil uang saya secara sepihak?</span>
                <span className="transition group-open:rotate-180">
                  <CaretDown size={16} weight="bold" aria-hidden="true" />
                </span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Tidak bisa. Sistem kami bersifat Non-Custodial dan dikendalikan oleh Smart Contract publik di jaringan Injective. Dana hanya bisa dilepas sesuai kesepakatan tanda tangan elektronik (EIP-712) antara pembeli dan penjual.
              </p>
            </details>
          </div>
        </div>
      </Container>
    </div>
  );
}
