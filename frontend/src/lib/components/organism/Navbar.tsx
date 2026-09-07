import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { ShieldCheck, Wallet, SignOut, List, X } from '@phosphor-icons/react';
import { Button } from '$lib/components/atoms/Button';
import { useCurrentUser } from '$lib/utils/useCurrentUser';
import { formatAddress } from '$lib/utils/format';

function BrandMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
      <ShieldCheck size={18} weight="fill" aria-hidden="true" />
    </span>
  );
}

function WalletChip({ walletAddress }: { walletAddress: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-2.5 py-1 font-mono text-xs text-slate-600"
      title={walletAddress}
    >
      <Wallet size={13} className="text-brand-600" aria-hidden="true" />
      {formatAddress(walletAddress)}
      <span className="h-1.5 w-1.5 rounded-full bg-success-600" aria-label="Wallet terhubung" />
    </span>
  );
}

export function Navbar() {
  const { ready, login, logout, authenticated, user } = usePrivy();
  const { user: currentUser } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const primaryLinks = (
    <>
      {(ready && authenticated) ? (
        <>
          <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          {currentUser?.isAdmin && (
            <Link to="/admin/disputes" className="nav-link" onClick={() => setMenuOpen(false)}>
              Panel Admin
            </Link>
          )}
        </>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-5 sm:px-8" aria-label="Navigasi utama">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <BrandMark />
          <span className="text-lg font-bold tracking-tight text-slate-900">Midtract</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          {!ready ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-100" />
          ) : authenticated ? (
            <>
              {primaryLinks}
              {user?.wallet?.address && <WalletChip walletAddress={user.wallet.address} />}
              <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<SignOut size={15} aria-hidden="true" />}>
                Keluar
              </Button>
            </>
          ) : (
            <Button onClick={login}>Masuk</Button>
          )}
        </div>

        {/* Tombol menu mobile */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <List size={20} aria-hidden="true" />}
        </button>
      </nav>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-surface px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {ready && authenticated ? (
              <>
                {primaryLinks}
                {user?.wallet?.address && <WalletChip walletAddress={user.wallet.address} />}
                <Button variant="secondary" onClick={handleLogout} leftIcon={<SignOut size={15} aria-hidden="true" />}>
                  Keluar
                </Button>
              </>
            ) : (
              <Button fullWidth onClick={login}>
                Masuk
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}