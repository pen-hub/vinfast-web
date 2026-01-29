import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const sessionTimestamp = localStorage.getItem('sessionTimestamp');
  const SESSION_DURATION = 24 * 60 * 60 * 1000;

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (!sessionTimestamp || Date.now() - parseInt(sessionTimestamp) > SESSION_DURATION) {
    localStorage.clear();
    return <Navigate to="/dang-nhap" replace />;
  }

  return children;
}

export default ProtectedRoute;
