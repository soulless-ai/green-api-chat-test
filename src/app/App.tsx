import { Routes, Route, Navigate } from 'react-router-dom';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { NotificationPoller } from '@/features/receive-messages/ui/NotificationPoller';
import { LoginPage } from '@/pages/login/LoginPage';
import { ChatsPage } from '@/pages/chats/ChatsPage';
import { ContactsList } from '@/widgets/contacts-list';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const credentials = useCredentialsStore((state) => state.credentials);
  if (!credentials) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const credentials = useCredentialsStore((state) => state.credentials);
  return (
    <>
      {credentials ? <NotificationPoller /> : null}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/chats/*"
          element={
            <RequireAuth>
              <ChatsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/contacts"
          element={
            <RequireAuth>
              <ContactsList />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to={credentials ? '/chats' : '/login'} replace />} />
      </Routes>
    </>
  );
}
