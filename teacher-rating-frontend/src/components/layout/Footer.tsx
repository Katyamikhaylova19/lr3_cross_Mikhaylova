import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const AppFooter: React.FC = () => {
  return (
    <AntFooter style={{ 
      textAlign: 'center',
      backgroundColor: '#f0f2f5',
      borderTop: '1px solid #d9d9d9'
    }}>
      <Text type="secondary">
        © {new Date().getFullYear()} Система рейтинга преподавателей. Все права защищены.
      </Text>
    </AntFooter>
  );
};

export default AppFooter;