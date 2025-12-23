import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import ruRU from 'antd/lib/locale/ru_RU';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppHeader from './components/layout/Header';
import AppSidebar from './components/layout/Sidebar';
import AppFooter from './components/layout/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeachersPage from './pages/Teachers';
import TeacherDetail from './pages/Teachers/TeacherDetail';
import CreateTeacher from './pages/Teachers/CreateTeacher';
import EditTeacher from './pages/Teachers/EditTeacher';
import StudentsPage from './pages/Students';
import CreateStudent from './pages/Students/CreateStudent';
import EditStudent from './pages/Students/EditStudent';
import StudentDetail from './pages/Students/StudentDetail';
import RatingsPage from './pages/Ratings';
import RatingDetail from './pages/Ratings/RatingDetail';
import CreateRating from './pages/Ratings/CreateRating';
import EditRating from './pages/Ratings/EditRating';
import Reports from './pages/Reports';
import './App.css';

const { Content } = Layout;

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSidebar />
        <Layout style={{ padding: '24px' }}>
          <Content style={{ 
            margin: 0,
            minHeight: 280,
            backgroundColor: '#fff',
            padding: 24,
            borderRadius: 8,
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
      <AppFooter />
    </Layout>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/teachers" 
        element={
          <PrivateRoute>
            <MainLayout>
              <TeachersPage />
            </MainLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/teachers/new" 
        element={
          <PrivateRoute>
            <MainLayout>
              <CreateTeacher />
            </MainLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/teachers/:id" 
        element={
          <PrivateRoute>
            <MainLayout>
              <TeacherDetail />
            </MainLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/teachers/edit/:id" 
        element={
          <PrivateRoute>
            <MainLayout>
              <EditTeacher />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/students" 
        element={
          <PrivateRoute>
            <MainLayout>
              <StudentsPage />
            </MainLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/students/new" 
        element={
          <PrivateRoute>
            <MainLayout>
              <CreateStudent />
            </MainLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/students/:id" 
        element={
          <PrivateRoute>
            <MainLayout>
              <StudentDetail />
            </MainLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/students/edit/:id" 
        element={
          <PrivateRoute>
            <MainLayout>
              <EditStudent />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/ratings" 
        element={
          <PrivateRoute>
            <MainLayout>
              <RatingsPage />
            </MainLayout>
          </PrivateRoute>
        } 
        />
       <Route 
        path="/ratings/new" 
        element={
          <PrivateRoute>
            <MainLayout>
              <CreateRating />
            </MainLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/ratings/:id" 
        element={
          <PrivateRoute>
            <MainLayout>
              <RatingDetail />
            </MainLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/ratings/edit/:id" 
        element={
          <PrivateRoute>
            <MainLayout>
              <EditRating />
            </MainLayout>
          </PrivateRoute>
        } 
      />

       <Route 
        path="/reports" 
        element={
          <PrivateRoute>
            <MainLayout>
              <Reports />
            </MainLayout>
          </PrivateRoute>
        } 
      />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={ruRU}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

export default App;