import React from 'react';
import { Layout, Typography, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: 'Выйти',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      backgroundColor: '#1890ff',
      padding: '0 24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0, color: 'white' }}>
          Рейтинг преподавателей
        </Title>
      </div>
      
      {user && (
        <Dropdown menu={{ items }} trigger={['click']}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            color: 'white'
          }}>
            <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <span>
              {user.username} ({user.role})
            </span>
          </div>
        </Dropdown>
      )}
    </AntHeader>
  );
};

export default AppHeader;