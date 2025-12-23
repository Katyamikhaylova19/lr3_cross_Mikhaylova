import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Statistic, 
  Table, 
  Space, 
  Rate,
  Progress,
  Button
} from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  StarOutlined, 
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teacherApi } from '../api/teachers';
import { studentApi } from '../api/students';
import { ratingApi } from '../api/ratings';
import { Teacher, Student, Rating } from '../types';

const { Title, Text } = Typography;

            interface TeacherWithAverage extends Teacher {
                averageRating: number;
            }

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
  teachers: 0,
  students: 0,
  ratings: 0,
  averageRating: 0,
  topTeachers: [] as TeacherWithAverage[],
  recentRatings: [] as Rating[],
  loading: true
});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [teachers, students, allRatings] = await Promise.all([
        teacherApi.getAllTeachers(),
        studentApi.getAllStudents(),
        ratingApi.getAllRatings()
      ]);

      // Вычисляем средний рейтинг
      const totalRating = allRatings.reduce((sum, rating) => sum + rating.score, 0);
      const averageRating = allRatings.length > 0 ? totalRating / allRatings.length : 0;

      // Находим топ преподавателей
        const topTeachers = teachers
            .filter(teacher => teacher.ratings && teacher.ratings.length > 0)
            .map(teacher => {
                const averageRating = teacher.ratings!.reduce((sum, r) => sum + r.score, 0) / teacher.ratings!.length;
                return {
                    ...teacher,
                    averageRating: Number(averageRating.toFixed(2))
                };
            })
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 5);



      // Последние оценки
      const recentRatings = [...allRatings]
        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
        .slice(0, 5);

      setStats({
        teachers: teachers.length,
        students: students.length,
        ratings: allRatings.length,
        averageRating: Number(averageRating.toFixed(2)),
        topTeachers: topTeachers as TeacherWithAverage[],
        recentRatings,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: 'Преподавателей',
      value: stats.teachers,
      icon: <TeamOutlined />,
      color: '#1890ff',
      suffix: '',
      description: 'Всего в системе'
    },
    {
      title: 'Студентов',
      value: stats.students,
      icon: <UserOutlined />,
      color: '#52c41a',
      suffix: '',
      description: 'Всего в системе'
    },
    {
      title: 'Оценок',
      value: stats.ratings,
      icon: <StarOutlined />,
      color: '#faad14',
      suffix: '',
      description: 'Всего поставлено'
    },
    {
      title: 'Средний рейтинг',
      value: stats.averageRating,
      icon: <BarChartOutlined />,
      color: '#722ed1',
      suffix: 'из 5',
      description: 'По всем преподавателям'
    }
  ];

  const topTeachersColumns = [
  {
    title: 'Преподаватель',
    key: 'teacher',
    render: (_: any, record: TeacherWithAverage) => (
      <Space>
        <Text strong>{record.lastName} {record.firstName[0]}.</Text>
      </Space>
    )
  },
  {
    title: 'Рейтинг',
    key: 'rating',
    render: (_: any, record: TeacherWithAverage) => (
      <Space>
        <Rate disabled value={record.averageRating} allowHalf />
        <Text strong>{record.averageRating}</Text>
      </Space>
    )
  },
  {
    title: 'Кол-во оценок',
    key: 'ratingsCount',
    render: (_: any, record: Teacher) => (
      <Text>{record.ratings?.length || 0}</Text>
    )
  },
  {
    title: 'Действия',
    key: 'actions',
    render: (_: any, record: Teacher) => (
      <Button 
        type="link" 
        icon={<EyeOutlined />} 
        onClick={() => navigate(`/teachers/${record.id}`)}
      />
    )
  }
];

  const recentRatingsColumns = [
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
      title: 'Студент',
      key: 'student',
      render: (_: any, record: Rating) => (
        record.isAnonymous ? 
          <Text type="secondary">Аноним</Text> : 
          <Text>
            {record.student?.lastName} {record.student?.firstName[0]}.
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
      title: 'Дата',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Панель управления</Title>
        <Text type="secondary">
          Добро пожаловать, {user?.username}! {isAdmin ? 'Вы вошли как администратор' : 'Вы вошли как пользователь'}
        </Text>
      </div>

      {/* Статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((stat, index) => (
          <Col key={index} xs={24} sm={12} md={12} lg={6}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {stat.description}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Основной контент */}
      <Row gutter={[16, 16]}>
        {/* Лучшие преподаватели */}
        <Col xs={24} lg={12}>
          <Card 
            title="Лучшие преподаватели" 
            loading={stats.loading}
            extra={
              <Button type="link" onClick={() => navigate('/teachers?sort=rating')}>
                Все преподаватели
              </Button>
            }
          >
            <Table
              dataSource={stats.topTeachers}
              columns={topTeachersColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Последние оценки */}
        <Col xs={24} lg={12}>
          <Card 
            title="Последние оценки" 
            loading={stats.loading}
            extra={
              <Button type="link" onClick={() => navigate('/ratings')}>
                Все оценки
              </Button>
            }
          >
            <Table
              dataSource={stats.recentRatings}
              columns={recentRatingsColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Распределение оценок */}
        <Col xs={24}>
          <Card title="Распределение оценок" loading={stats.loading}>
            <Row gutter={[16, 16]}>
              {[5, 4, 3, 2, 1].map(score => {
                const count = stats.recentRatings.filter(r => r.score === score).length;
                const total = stats.recentRatings.length;
                const percentage = total > 0 ? (count / total * 100) : 0;
                
                return (
                  <Col key={score} xs={24} sm={24} md={12} lg={4.8}>
                    <Card size="small">
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <Rate disabled defaultValue={score} />
                        <Statistic
                          title={`${score} звезд`}
                          value={count}
                          suffix={`(${percentage.toFixed(1)}%)`}
                        />
                        <Progress 
                          percent={percentage} 
                          size="small" 
                          strokeColor={
                            score >= 4 ? '#52c41a' : 
                            score >= 3 ? '#1890ff' : 
                            '#ff4d4f'
                          }
                        />
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>

        {/* Быстрые действия */}
        {isAdmin && (
          <Col xs={24}>
            <Card title="Быстрые действия">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card 
                    hoverable
                    onClick={() => navigate('/teachers/new')}
                    style={{ textAlign: 'center' }}
                  >
                    <TeamOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>Добавить преподавателя</Text>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card 
                    hoverable
                    onClick={() => navigate('/students/new')}
                    style={{ textAlign: 'center' }}
                  >
                    <UserOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>Добавить студента</Text>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card 
                    hoverable
                    onClick={() => navigate('/ratings')}
                    style={{ textAlign: 'center' }}
                  >
                    <StarOutlined style={{ fontSize: '32px', color: '#faad14' }} />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>Просмотреть оценки</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Dashboard;