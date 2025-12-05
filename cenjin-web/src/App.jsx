import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ToastContainer from './components/Toast/ToastContainer';
import Login from './pages/Login';
import Main from './pages/Main';
import Home from './pages/Main/Home';
import Client from './pages/Main/Client';
import Orders from './pages/Main/Orders';
import MemberCard from './pages/Main/Orders/MemberCard';
import Statistics from './pages/Main/Statistics';
import PrivateRoute from './components/PrivateRoute';
import './App.scss';

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/main" element={<PrivateRoute><Main /></PrivateRoute>}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="client" element={<Client />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/member-card" element={<MemberCard />} />
            <Route path="statistics" element={<Statistics />} />
          </Route>
          <Route path="/" element={<Navigate to="/main/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
