import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TeachersPage from './pages/Teachers/index';
import StudentsPage from './pages/Students';
import RatingsPage from './pages/Ratings';
import TeacherDetail from './pages/Teachers/TeacherDetail';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/teachers" element={<PrivateRoute><TeachersPage /></PrivateRoute>} />
      <Route path="/teachers/:id" element={<PrivateRoute><TeacherDetail /></PrivateRoute>} />
      <Route path="/students" element={<PrivateRoute><StudentsPage /></PrivateRoute>} />
      <Route path="/ratings" element={<PrivateRoute><RatingsPage /></PrivateRoute>} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    </Routes>
  );
};

export default AppRoutes;