import React from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StudentForm from '../../components/forms/StudentForm';

const CreateStudent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/students')}
          type="text"
        >
          Назад к списку
        </Button>
        
        <StudentForm />
      </Space>
    </div>
  );
};

export default CreateStudent;