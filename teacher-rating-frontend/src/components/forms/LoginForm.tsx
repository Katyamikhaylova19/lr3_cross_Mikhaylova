import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { LoginRequest } from '../../types';
import message from 'antd/lib/message';

interface LoginFormProps {
  onLogin: (credentials: LoginRequest) => Promise<void>;
  loading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading, error }) => {
  const [form] = Form.useForm();

    const handleSubmit = async (values: LoginRequest) => {
        // Валидация
        if (!values.username.trim()) {
            message.error('Введите логин');
            return;
        }

        if (!values.password.trim()) {
            message.error('Введите пароль');
            return;
        }

        try {
            await onLogin(values);
        } catch (err) {
            console.error('Login error:', err);
        }
    };

  return (
    <Card style={{ maxWidth: 400, margin: '0 auto' }}>
      <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Вход в систему
      </Typography.Title>

      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: 'Введите логин' },
            { min: 3, message: 'Логин должен быть не менее 3 символов' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Логин"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 6, message: 'Пароль должен быть не менее 6 символов' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Войти
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary">
            Используйте admin/admin123 или user/user123 для тестирования
          </Typography.Text>
        </div>
      </Form>
    </Card>
  );
};

export default LoginForm;