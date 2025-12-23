import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Tag, 
  Space, 
  Button, 
  Table, 
  Rate,
  message,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined,
  TeamOutlined,
  StarFilled,
  UserOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teacherApi } from '../../api/teachers';
import { Teacher, Rating } from '../../types';

const { Title, Text } = Typography;

const TeacherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await teacherApi.getTeacherById(parseInt(id));
      setTeacher(data);
    } catch (error) {
      message.error('Не удалось загрузить информацию о преподавателе');
      navigate('/teachers');
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return null;

  const averageRating = teacher.ratings && teacher.ratings.length > 0
    ? teacher.ratings.reduce((sum, r) => sum + r.score, 0) / teacher.ratings.length
    : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map(score => ({
    score,
    count: teacher.ratings?.filter(r => r.score === score).length || 0,
    percentage: teacher.ratings?.length 
      ? (teacher.ratings.filter(r => r.score === score).length / teacher.ratings.length * 100).toFixed(1)
      : '0'
  }));

  const columns = [
    {
      title: 'Оценка',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => <Rate disabled defaultValue={score} count={5} />,
    },
    {
      title: 'Отзыв',
      dataIndex: 'review',
      key: 'review',
      render: (review: string) => review || <Text type="secondary">Нет отзыва</Text>,
    },
    {
      title: 'Студент',
      key: 'student',
      render: (_: any, record: Rating) => (
        record.isAnonymous ? 
          <Text type="secondary">Аноним</Text> : 
          `${record.student?.lastName} ${record.student?.firstName[0]}.`
      ),
    },
    {
      title: 'Группа',
      key: 'group',
      render: (_: any, record: Rating) => record.student?.group?.groupNumber || '-',
    },
    {
      title: 'Дата',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

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

        <Card loading={loading}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={3}>
                {teacher.lastName} {teacher.firstName} {teacher.middleName}
              </Title>
            </Col>
            <Col>
              {isAdmin && (
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(`/teachers/edit/${teacher.id}`)}
                >
                  Редактировать
                </Button>
              )}
            </Col>
          </Row>

          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic
                title="Средний рейтинг"
                value={averageRating}
                precision={2}
                prefix={<StarFilled style={{ color: '#ffc107' }} />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Количество оценок"
                value={teacher.ratings?.length || 0}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Количество групп"
                value={teacher.teacherGroups?.length || 0}
                prefix={<TeamOutlined />}
              />
            </Col>
          </Row>

          <Descriptions title="Информация" bordered column={1} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Фамилия">{teacher.lastName}</Descriptions.Item>
            <Descriptions.Item label="Имя">{teacher.firstName}</Descriptions.Item>
            <Descriptions.Item label="Отчество">
              {teacher.middleName || 'не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Группы">
              <Space wrap>
                {teacher.teacherGroups?.map(tg => (
                  <Tag key={tg.id} color="blue">
                    {tg.group?.groupNumber}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <Card title="Распределение оценок" style={{ marginBottom: 24 }}>
            {ratingDistribution.map(({ score, count, percentage }) => (
              <div key={score} style={{ marginBottom: 8 }}>
                <Space>
                  <Text>{score} звезд:</Text>
                  <div style={{ 
                    width: '200px', 
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: score >= 4 ? '#52c41a' : score >= 3 ? '#1890ff' : '#ff4d4f',
                        height: '20px',
                        transition: 'width 0.3s'
                      }} 
                    />
                  </div>
                  <Text>{count} ({percentage}%)</Text>
                </Space>
              </div>
            ))}
          </Card>

          <Card title="Последние оценки">
            <Table
              dataSource={teacher.ratings?.slice(-5).reverse() || []}
              columns={columns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Card>
      </Space>
    </div>
  );
};

export default TeacherDetail;