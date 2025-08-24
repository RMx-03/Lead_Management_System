import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LeadsPage from './pages/LeadsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={/* Register Page */} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <LeadsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}