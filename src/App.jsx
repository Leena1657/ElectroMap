import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './views/components/Layout.jsx';
import MapPage from './views/pages/MapPage.jsx';
import RoutePage from './views/pages/RoutePage.jsx';
import ProfilePage from './views/pages/ProfilePage.jsx';
import AuthPage from './views/pages/AuthPage.jsx';
import AdminPage from './views/pages/AdminPage.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/map" replace />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/map" replace />} />
        <Route path="map" element={<MapPage />} />
        <Route path="route" element={<RoutePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
