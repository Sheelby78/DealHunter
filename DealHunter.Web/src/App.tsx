import { AuthProvider } from '@/shared/context/AuthContext';
import { ProtectedLayout } from '@/shared/components/ProtectedLayout';
import { Dashboard } from '@/pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        <Dashboard />
      </ProtectedLayout>
    </AuthProvider>
  );
}
