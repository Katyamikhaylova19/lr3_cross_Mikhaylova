import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { ratingApi } from '../../api/ratings';
import RatingForm from '../../components/forms/RatingForm';
import { Rating } from '../../types';

const EditRating: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRating();
  }, [id]);

  const fetchRating = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await ratingApi.getRatingById(parseInt(id));
      setRating(data);
    } catch (error) {
      message.error('Не удалось загрузить данные оценки');
      navigate('/ratings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  }

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
        
        {rating && <RatingForm isEdit initialData={rating} />}
      </Space>
    </div>
  );
};

export default EditRating;