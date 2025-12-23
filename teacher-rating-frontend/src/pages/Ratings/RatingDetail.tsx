import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Tag, 
  Space, 
  Button, 
  Rate,
  message,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  StarOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { ratingApi } from '../../api/ratings';
import { Rating as RatingType } from '../../types';

const { Title, Text } = Typography;

const RatingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { currentStudent } = useCurrentStudent();
  
  const [rating, setRating] = useState<RatingType | null>(null);
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
      message.error('Не удалось загрузить информацию об оценке');
      navigate('/ratings');
    } finally {
      setLoading(false);
    }
  };

  if (!rating) return null;

  const currentUserId = currentStudent?.id || 1;
  const canModify = isAdmin || rating.student?.id === currentUserId;

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

        <Card loading={loading}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={3}>Оценка #{rating.id}</Title>
            </Col>
            <Col>
              {canModify && (
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(`/ratings/edit/${rating.id}`)}
                >
                  Редактировать
                </Button>
              )}
            </Col>
          </Row>

          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Statistic
                title="Оценка"
                value={rating.score}
                prefix={<StarOutlined style={{ color: '#ffc107' }} />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Преподаватель"
                value={rating.teacher ? 1 : 0}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Студент"
                value={rating.student ? 1 : 0}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Дата"
                value={new Date(rating.createdDate).toLocaleDateString()}
                prefix={<CalendarOutlined />}
              />
            </Col>
          </Row>

          <Descriptions title="Подробная информация" bordered column={1} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Оценка">
              <Space>
                <Rate disabled defaultValue={rating.score} />
                <Text strong>{rating.score} звезд</Text>
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Преподаватель">
              <Space>
                <TeamOutlined />
                <Text strong>
                  {rating.teacher?.lastName} {rating.teacher?.firstName} {rating.teacher?.middleName}
                </Text>
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Студент">
              {rating.isAnonymous ? (
                <Text type="secondary">Аноним</Text>
              ) : (
                <Space>
                  <UserOutlined />
                  <Text>
                    {rating.student?.lastName} {rating.student?.firstName} {rating.student?.middleName}
                  </Text>
                </Space>
              )}
            </Descriptions.Item>
            
            <Descriptions.Item label="Группа">
              <Tag color="blue">
                {rating.student?.group?.groupNumber || 'Не указана'}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Отзыв">
              {rating.review ? (
                <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                  {rating.review}
                </Card>
              ) : (
                <Text type="secondary">Нет отзыва</Text>
              )}
            </Descriptions.Item>
            
            <Descriptions.Item label="Анонимность">
              <Tag color={rating.isAnonymous ? 'orange' : 'green'}>
                {rating.isAnonymous ? 'Анонимная оценка' : 'Имя указано'}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Дата создания">
              <Space>
                <CalendarOutlined />
                <Text>{new Date(rating.createdDate).toLocaleString()}</Text>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
};

export default RatingDetail;