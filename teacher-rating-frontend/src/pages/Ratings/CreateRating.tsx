import React from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import RatingForm from '../../components/forms/RatingForm';

const CreateRating: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/ratings')}
          type="text"
        >
          Назад к списку
        </Button>
        
        <RatingForm />
      </Space>
    </div>
  );
};

export default CreateRating;