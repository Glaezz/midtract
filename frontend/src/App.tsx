import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '$lib/components/organism/Navbar';
import { Footer } from '$lib/components/organism/Footer';
import { LandingPage } from '$lib/features/landing/LandingPage';
import { LoginPage } from '$lib/features/onboarding/LoginPage';
import { OnboardingPage } from '$lib/features/onboarding/OnboardingPage';
import { DashboardPage } from '$lib/features/dashboard/DashboardPage';
import { RekberCreatePage } from '$lib/features/rekber/RekberCreatePage';
import { InviteJoinPage } from '$lib/features/rekber/InviteJoinPage';
import { RekberDetailPage } from '$lib/features/rekber/RekberDetailPage';
import { AdminDisputesPage } from '$lib/features/admin/AdminDisputesPage';
import { useSyncUser } from '$lib/features/onboarding/useSyncUser';

export default function App() {
  useSyncUser(); // jalan otomatis begitu user login

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rekber/new" element={<RekberCreatePage />} />
          <Route path="/rekber/i/:inviteToken" element={<InviteJoinPage />} />
          <Route path="/rekber/:orderCode" element={<RekberDetailPage />} />
          <Route path="/admin/disputes" element={<AdminDisputesPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </BrowserRouter>
  );
}
