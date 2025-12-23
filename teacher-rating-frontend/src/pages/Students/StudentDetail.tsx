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
  UserOutlined,
  StarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../api/students';
import { Student, Rating } from '../../types';

const { Title, Text } = Typography;

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await studentApi.getStudentById(parseInt(id));
      setStudent(data);
    } catch (error) {
      message.error('Не удалось загрузить информацию о студенте');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  const averageRating = student.ratings && student.ratings.length > 0
    ? student.ratings.reduce((sum, r) => sum + r.score, 0) / student.ratings.length
    : 0;

  const columns = [
    {
      title: 'Преподаватель',
      key: 'teacher',
      render: (_: any, record: Rating) => (
        <Text>
          {record.teacher?.lastName} {record.teacher?.firstName[0]}.
        </Text>
      )
    },
    {
      title: 'Оценка',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => <Rate disabled defaultValue={score} />
    },
    {
      title: 'Отзыв',
      dataIndex: 'review',
      key: 'review',
      render: (review: string) => review || <Text type="secondary">Нет отзыва</Text>
    },
    {
      title: 'Анонимно',
      dataIndex: 'isAnonymous',
      key: 'isAnonymous',
      render: (isAnonymous: boolean) => (
        <Tag color={isAnonymous ? 'orange' : 'green'}>
          {isAnonymous ? 'Да' : 'Нет'}
        </Tag>
      )
    },
    {
      title: 'Дата',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

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

        <Card loading={loading}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={3}>
                {student.lastName} {student.firstName} {student.middleName}
              </Title>
            </Col>
            <Col>
              {isAdmin && (
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(`/students/edit/${student.id}`)}
                >
                  Редактировать
                </Button>
              )}
            </Col>
          </Row>

          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic
                title="Средняя оценка"
                value={averageRating}
                precision={2}
                prefix={<StarOutlined style={{ color: '#ffc107' }} />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Количество оценок"
                value={student.ratings?.length || 0}
                prefix={<StarOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Группа"
                value={student.group?.groupNumber || 'Не указана'}
                prefix={<TeamOutlined />}
              />
            </Col>
          </Row>

          <Descriptions title="Информация" bordered column={1} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Фамилия">{student.lastName}</Descriptions.Item>
            <Descriptions.Item label="Имя">{student.firstName}</Descriptions.Item>
            <Descriptions.Item label="Отчество">
              {student.middleName || 'не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Группа">
              <Tag color="blue">
                {student.group?.groupNumber || 'Не указана'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Card title="Оценки студента">
            <Table
              dataSource={student.ratings || []}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: true
              }}
            />
          </Card>
        </Card>
      </Space>
    </div>
  );
};

export default StudentDetail;