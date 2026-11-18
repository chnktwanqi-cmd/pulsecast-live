import { Link, Route, Routes } from 'react-router-dom';
import { AdminPage } from '../features/admin/AdminPage';
import { ContractorsPage } from '../features/contractors/ContractorsPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { EmergencyPage } from '../features/emergency/EmergencyPage';
import { ExpiryPage } from '../features/expiry/ExpiryPage';
import { PublicProfilePage } from '../features/public-profile/PublicProfilePage';
import { QrGalleryPage } from '../features/qr/QrGalleryPage';
import { QrPrintPage } from '../features/qr/QrPrintPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { StrikesPage } from '../features/strikes/StrikesPage';
import { TrainingPage } from '../features/training/TrainingPage';
import { RegisterWorkerPage } from '../features/workers/RegisterWorkerPage';
import { WorkerDetailPage } from '../features/workers/WorkerDetailPage';
import { WorkerRegistryPage } from '../features/workers/WorkerRegistryPage';
import { GlassCard } from '../components/ui/GlassCard';
import { AppLayout } from './AppLayout';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/p/:publicToken" element={<PublicProfilePage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workers" element={<WorkerRegistryPage />} />
        <Route path="/workers/new" element={<RegisterWorkerPage />} />
        <Route path="/workers/:workerId" element={<WorkerDetailPage />} />
        <Route path="/qr" element={<QrGalleryPage />} />
        <Route path="/qr/:workerId" element={<QrPrintPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/expiry" element={<ExpiryPage />} />
        <Route path="/strikes" element={<StrikesPage />} />
        <Route path="/contractors" element={<ContractorsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="*"
          element={
            <GlassCard className="p-8 text-center">
              <p className="text-sm text-slate-500">This page is not in the prototype.</p>
              <Link to="/" className="mt-3 inline-block text-sm font-semibold text-pink-600">
                Back to Overview
              </Link>
            </GlassCard>
          }
        />
      </Route>
    </Routes>
  );
}
