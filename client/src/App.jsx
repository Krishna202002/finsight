import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext.jsx';
import Login from './pages/Login';
import Register from './pages/Register.jsx';

import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

import Transactions from './pages/Transactions';

import Accounts from './pages/Accounts';

import Budgets from './pages/Budgets';
import SmartFeatures from './pages/SmartFeatures';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};


function AppRoutes() {
  return (
    <Routes>
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><SmartFeatures /></ProtectedRoute>} />   
      <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
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