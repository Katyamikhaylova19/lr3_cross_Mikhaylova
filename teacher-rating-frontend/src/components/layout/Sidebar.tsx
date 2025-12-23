import React from 'react';
import { Layout, Menu } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  StarOutlined,
  DashboardOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
    },
    {
      key: '/teachers',
      icon: <TeamOutlined />,
      label: 'Преподаватели',
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: 'Студенты',
    },
    {
      key: '/ratings',
      icon: <StarOutlined />,
      label: 'Оценки',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Отчеты',
    },
  ];

  return (
    <Sider
      width={200}
      style={{
        backgroundColor: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default AppSidebar;