import React from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TeacherForm from '../../components/forms/TeacherForm';

const CreateTeacher: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/teachers')}
          type="text"
        >
          Назад к списку
        </Button>
        
        <TeacherForm />
      </Space>
    </div>
  );
};

export default CreateTeacher;