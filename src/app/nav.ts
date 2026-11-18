import {
  AlertTriangle,
  Building2,
  CalendarClock,
  FileBarChart,
  GraduationCap,
  LayoutGrid,
  Phone,
  QrCode,
  Settings,
  Users,
} from 'lucide-react';

export const NAV = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/workers', label: 'Worker Registry', icon: Users },
  { to: '/qr', label: 'QR Helmet IDs', icon: QrCode },
  { to: '/training', label: 'Training & SIC', icon: GraduationCap },
  { to: '/expiry', label: 'Permit Expiry', icon: CalendarClock },
  { to: '/strikes', label: 'Safety Strikes', icon: AlertTriangle, badge: true },
  { to: '/contractors', label: 'Contractors', icon: Building2 },
  { to: '/reports', label: 'Reports & Audit', icon: FileBarChart },
  { to: '/emergency', label: 'Emergency Contacts', icon: Phone },
  { to: '/admin', label: 'Settings', icon: Settings },
] as const;
