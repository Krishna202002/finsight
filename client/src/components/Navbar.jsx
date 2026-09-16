import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 32px', borderBottom: '1px solid #d0d7de' }}>
      <div style={{ display: 'flex', gap: 20 }}>
        <strong>FinSight</strong>
        <Link to="/dashboard">Dashboard</Link>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span>{user?.name}</span>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  );
};

export default Navbar;