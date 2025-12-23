import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'antd';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/forms/LoginForm';
import { authApi } from '../api/auth';
import { LoginRequest } from '../types';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials: LoginRequest) => {
    setLoading(true);
    setError('');
    
    try {
      const token = await authApi.login(credentials);
      login(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f2f5',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <LoginForm 
          onLogin={handleLogin} 
          loading={loading} 
          error={error}
        />
      </div>
    </div>
  );
};

export default Login;