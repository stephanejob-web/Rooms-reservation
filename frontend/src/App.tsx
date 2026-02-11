import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import RoomList from './pages/Rooms/RoomList';
import MyReservations from './pages/Reservations/MyReservations';
import BookingForm from './pages/Reservations/BookingForm';
import EditReservation from './pages/Reservations/EditReservation';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/rooms" replace />} />
            <Route path="rooms" element={<RoomList />} />
            <Route path="rooms/:id/book" element={
              <ProtectedRoute>
                <BookingForm />
              </ProtectedRoute>
            } />

            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="my-reservations" element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            } />

            <Route path="reservations/:id/edit" element={
              <ProtectedRoute>
                <EditReservation />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
