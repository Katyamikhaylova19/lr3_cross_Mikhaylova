import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Table, 
  Space, 
  Button, 
  Select, 
  Statistic, 
  Progress, 
  Rate,
  Tag,
  DatePicker,
  message,
  Empty,
  List,
  Avatar
} from 'antd';
import { 
  BarChartOutlined, 
  TeamOutlined, 
  StarOutlined, 
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teacherApi } from '../api/teachers';
import { studentApi } from '../api/students';
import { ratingApi } from '../api/ratings';
import { Teacher, Student, Rating } from '../types';
import type { TableColumnType } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ReportData {
  type: 'overview' | 'teachers' | 'students' | 'groups';
  title: string;
  description: string;
  data: any[];
  columns: TableColumnType<any>[];
}

const Reports: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [statistics, setStatistics] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalRatings: 0,
    avgRating: 0,
    ratingDistribution: [] as { score: number; count: number; percentage: number }[]
  });

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const [teachers, students, ratings] = await Promise.all([
        teacherApi.getAllTeachers(),
        studentApi.getAllStudents(),
        ratingApi.getAllRatings()
      ]);

      // Расчет статистики
      const totalRatings = ratings.length;
      const totalRating = ratings.reduce((sum, r) => sum + r.score, 0);
      const avgRating = totalRatings > 0 ? totalRating / totalRatings : 0;

      // Распределение оценок
      const distribution = [5, 4, 3, 2, 1].map(score => {
        const count = ratings.filter(r => r.score === score).length;
        return {
          score,
          count,
          percentage: totalRatings > 0 ? (count / totalRatings * 100) : 0
        };
      });

      setStatistics({
        totalTeachers: teachers.length,
        totalStudents: students.length,
        totalRatings,
        avgRating: Number(avgRating.toFixed(2)),
        ratingDistribution: distribution
      });
    } catch (error) {
      message.error('Не удалось загрузить статистику');
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReportData = useCallback(async () => {
    if (!activeReport) return;

    setLoading(true);
    try {
      let data: any[] = [];
      let columns: TableColumnType<any>[] = [];
      let title = '';
      let description = '';
      const type = activeReport as ReportData['type'];

      switch (activeReport) {
        case 'overview':
          // Данные для общего отчета уже в statistics
          const teachers = await teacherApi.getAllTeachers();
          data = teachers.map(teacher => {
            const avgRating = teacher.ratings && teacher.ratings.length > 0
              ? teacher.ratings.reduce((sum, r) => sum + r.score, 0) / teacher.ratings.length
              : 0;
            return {
              ...teacher,
              averageRating: avgRating,
              ratingCount: teacher.ratings?.length || 0
            };
          });
          
          columns = [
            {
              title: 'Преподаватель',
              key: 'teacher',
              render: (_: any, record: Teacher) => (
                <Space>
                  <Avatar icon={<TeamOutlined />} />
                  <Text strong>
                    {record.lastName} {record.firstName[0]}.{record.middleName ? ` ${record.middleName[0]}.` : ''}
                  </Text>
                </Space>
              )
            },
            {
              title: 'Средний рейтинг',
              key: 'averageRating',
              render: (_: any, record: any) => (
                <Space>
                  <Rate disabled value={record.averageRating} allowHalf />
                  <Text strong>{record.averageRating.toFixed(2)}</Text>
                </Space>
              ),
              sorter: (a: any, b: any) => a.averageRating - b.averageRating
            },
            {
              title: 'Кол-во оценок',
              key: 'ratingCount',
              dataIndex: 'ratingCount',
              sorter: (a: any, b: any) => a.ratingCount - b.ratingCount
            },
            {
              title: 'Группы',
              key: 'groups',
              render: (_: any, record: Teacher) => (
                <Space wrap>
                  {record.teacherGroups?.slice(0, 2).map(tg => (
                    <Tag key={tg.id} color="blue" style={{ fontSize: '12px' }}>
                      {tg.group?.groupNumber}
                    </Tag>
                  ))}
                  {record.teacherGroups && record.teacherGroups.length > 2 && (
                    <Tag style={{ fontSize: '12px' }}>+{record.teacherGroups.length - 2}</Tag>
                  )}
                </Space>
              )
            }
          ];
          
          title = 'Общий отчет по преподавателям';
          description = 'Сводная информация по всем преподавателям системы';
          break;

        case 'teachers':
          const topTeachers = await teacherApi.getTopRated(10);
          data = topTeachers.map((teacher, index) => {
            const avgRating = teacher.ratings && teacher.ratings.length > 0
              ? teacher.ratings.reduce((sum, r) => sum + r.score, 0) / teacher.ratings.length
              : 0;
            return {
              rank: index + 1,
              ...teacher,
              averageRating: avgRating,
              ratingCount: teacher.ratings?.length || 0
            };
          });
          
          columns = [
            {
              title: 'Место',
              dataIndex: 'rank',
              key: 'rank',
              render: (rank: number) => (
                <Tag color={rank <= 3 ? 'gold' : 'default'} style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  #{rank}
                </Tag>
              )
            },
            {
              title: 'Преподаватель',
              key: 'teacher',
              render: (_: any, record: Teacher) => (
                <Space>
                  <Avatar 
                    style={{ 
                      backgroundColor: '#1890ff',
                      color: '#fff'
                    }}
                    icon={<TeamOutlined />}
                  />
                  <div>
                    <Text strong>{record.lastName} {record.firstName}</Text>
                    <br />
                    <Text type="secondary">{record.middleName || ''}</Text>
                  </div>
                </Space>
              )
            },
            {
              title: 'Рейтинг',
              key: 'rating',
              render: (_: any, record: any) => (
                <Space>
                  <Rate disabled value={record.averageRating} allowHalf />
                  <Text strong>{record.averageRating.toFixed(2)}</Text>
                  <Text type="secondary">({record.ratingCount} оценок)</Text>
                </Space>
              ),
              sorter: (a: any, b: any) => a.averageRating - b.averageRating
            },
            {
              title: 'Действия',
              key: 'actions',
              render: (_: any, record: Teacher) => (
                <Button 
                  icon={<EyeOutlined />} 
                  onClick={() => navigate(`/teachers/${record.id}`)}
                  type="link"
                />
              )
            }
          ];
          
          title = 'Топ 10 преподавателей';
          description = 'Рейтинг лучших преподавателей по среднему баллу';
          break;

        case 'students':
          const students = await studentApi.getAllStudents();
          data = students
            .filter(s => s.ratings && s.ratings.length > 0)
            .map(student => {
              const avgRating = student.ratings!.reduce((sum, r) => sum + r.score, 0) / student.ratings!.length;
              return {
                ...student,
                averageRating: avgRating,
                ratingCount: student.ratings?.length || 0
              };
            })
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 10);
          
          columns = [
            {
              title: 'Студент',
              key: 'student',
              render: (_: any, record: Student) => (
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <Text strong>{record.lastName} {record.firstName}</Text>
                    <br />
                    <Text type="secondary">{record.middleName || ''}</Text>
                  </div>
                </Space>
              )
            },
            {
              title: 'Группа',
              key: 'group',
              render: (_: any, record: Student) => (
                <Tag color="blue">
                  {record.group?.groupNumber || 'Не указана'}
                </Tag>
              )
            },
            {
              title: 'Средняя оценка',
              key: 'averageRating',
              render: (_: any, record: any) => (
                <Space>
                  <Rate disabled value={record.averageRating} allowHalf />
                  <Text strong>{record.averageRating.toFixed(2)}</Text>
                </Space>
              ),
              sorter: (a: any, b: any) => a.averageRating - b.averageRating
            },
            {
              title: 'Кол-во оценок',
              dataIndex: 'ratingCount',
              key: 'ratingCount',
              sorter: (a: any, b: any) => a.ratingCount - b.ratingCount
            }
          ];
          
          title = 'Топ 10 студентов';
          description = 'Студенты с наибольшим количеством и средним баллом оценок';
          break;

        case 'groups':
          // Здесь нужно получить статистику по группам
          // Для примера используем данные из студентов
          const allStudents = await studentApi.getAllStudents();
          const groupsMap = new Map<string, any>();
          
          allStudents.forEach(student => {
            if (student.group) {
              const groupNumber = student.group.groupNumber;
              if (!groupsMap.has(groupNumber)) {
                groupsMap.set(groupNumber, {
                  groupNumber,
                  studentCount: 0,
                  ratingCount: 0,
                  totalRating: 0,
                  students: []
                });
              }
              
              const groupData = groupsMap.get(groupNumber)!;
              groupData.studentCount++;
              groupData.students.push(student);
              
              if (student.ratings) {
                student.ratings.forEach(rating => {
                  groupData.ratingCount++;
                  groupData.totalRating += rating.score;
                });
              }
            }
          });
          
          data = Array.from(groupsMap.values()).map(group => ({
            ...group,
            averageRating: group.ratingCount > 0 ? group.totalRating / group.ratingCount : 0
          }));
          
          columns = [
            {
              title: 'Группа',
              dataIndex: 'groupNumber',
              key: 'groupNumber',
              render: (groupNumber: string) => (
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                  {groupNumber}
                </Tag>
              )
            },
            {
              title: 'Кол-во студентов',
              dataIndex: 'studentCount',
              key: 'studentCount',
              sorter: (a: any, b: any) => a.studentCount - b.studentCount
            },
            {
              title: 'Кол-во оценок',
              dataIndex: 'ratingCount',
              key: 'ratingCount',
              sorter: (a: any, b: any) => a.ratingCount - b.ratingCount
            },
            {
              title: 'Средний рейтинг',
              key: 'averageRating',
              render: (_: any, record: any) => (
                <Space>
                  <Rate disabled value={record.averageRating} allowHalf />
                  <Text strong>{record.averageRating.toFixed(2)}</Text>
                </Space>
              ),
              sorter: (a: any, b: any) => a.averageRating - b.averageRating
            }
          ];
          
          title = 'Статистика по группам';
          description = 'Сводная информация по успеваемости в группах';
          break;
      }

      setReportData({
        type,
        title,
        description,
        data,
        columns
      });
    } catch (error) {
      message.error('Не удалось загрузить данные отчета');
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeReport, navigate]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = () => {
    // В реальном приложении здесь будет экспорт в Excel/PDF
    message.success('Экспорт отчета начат (функция в разработке)');
  };

  const reportTypes = [
    {
      key: 'overview',
      title: 'Общий отчет',
      icon: <BarChartOutlined />,
      description: 'Сводная статистика по системе'
    },
    {
      key: 'teachers',
      title: 'Топ преподавателей',
      icon: <TeamOutlined />,
      description: 'Рейтинг лучших преподавателей'
    },
    {
      key: 'students',
      title: 'Топ студентов',
      icon: <UserOutlined />,
      description: 'Студенты с наибольшей активностью'
    },
    {
      key: 'groups',
      title: 'Статистика по группам',
      icon: <StarOutlined />,
      description: 'Анализ успеваемости по группам'
    }
  ];

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={{ color }}
      />
    </Card>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Отчеты и аналитика</Title>
        <Text type="secondary">
          Аналитические отчеты и статистика системы рейтингов
        </Text>
      </div>

      {/* Основная статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="Преподавателей"
            value={statistics.totalTeachers}
            icon={<TeamOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="Студентов"
            value={statistics.totalStudents}
            icon={<UserOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="Оценок"
            value={statistics.totalRatings}
            icon={<StarOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="Средний рейтинг"
            value={statistics.avgRating}
            icon={<BarChartOutlined />}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* Распределение оценок */}
      <Card title="Распределение оценок" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {statistics.ratingDistribution.map(({ score, count, percentage }) => (
            <Col key={score} xs={24} sm={12} md={4.8}>
              <Card size="small">
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Rate disabled value={score} />
                  <Statistic
                    title={`${score} звезд`}
                    value={count}
                    suffix={`(${percentage.toFixed(1)}%)`}
                  />
                  <Progress 
                    percent={Number(percentage.toFixed(1))} 
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
          ))}
        </Row>
      </Card>

      {/* Выбор типа отчета и фильтры */}
      <Card 
        title="Генерация отчетов" 
        extra={
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={!reportData}
          >
            Экспорт отчета
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Space wrap>
              {reportTypes.map(report => (
                <Button
                  key={report.key}
                  type={activeReport === report.key ? 'primary' : 'default'}
                  icon={report.icon}
                  onClick={() => setActiveReport(report.key)}
                  size="large"
                >
                  {report.title}
                </Button>
              ))}
            </Space>
          </Col>
          
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Период:</Text>
              <RangePicker 
                style={{ width: '100%' }}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0].toDate(), dates[1].toDate()]);
                  } else {
                    setDateRange(null);
                  }
                }}
              />
            </Space>
          </Col>
          
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Группа:</Text>
              <Select
                placeholder="Выберите группу"
                style={{ width: '100%' }}
                value={selectedGroup}
                onChange={setSelectedGroup}
                allowClear
              >
                <Option value="all">Все группы</Option>
                <Option value="АС-22-04">АС-22-04</Option>
                <Option value="АС-22-05">АС-22-05</Option>
                <Option value="АА-22-07">АА-22-07</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Отчет */}
      {reportData ? (
        <Card 
          title={reportData.title}
          loading={loading}
          extra={
            <Space>
              <Text type="secondary">{reportData.description}</Text>
            </Space>
          }
        >
          {reportData.data.length > 0 ? (
            <Table
              dataSource={reportData.data}
              columns={reportData.columns}
              rowKey={(record: any) => record.id || record.groupNumber}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true
              }}
              scroll={{ x: 800 }}
            />
          ) : (
            <Empty description="Нет данных для отображения" />
          )}
        </Card>
      ) : (
        <Card loading={loading}>
          <Empty description="Выберите тип отчета" />
        </Card>
      )}

      {/* Быстрые отчеты */}
      <Card title="Быстрые отчеты" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable
              onClick={() => navigate('/teachers?sort=rating')}
              style={{ textAlign: 'center' }}
            >
              <TeamOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <div style={{ marginTop: '8px' }}>
                <Text strong>Преподаватели без оценок</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable
              onClick={() => navigate('/students?sort=ratings')}
              style={{ textAlign: 'center' }}
            >
              <UserOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <div style={{ marginTop: '8px' }}>
                <Text strong>Самые активные студенты</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              hoverable
              onClick={() => navigate('/teachers/top-rated')}
              style={{ textAlign: 'center' }}
            >
              <StarOutlined style={{ fontSize: '32px', color: '#faad14' }} />
              <div style={{ marginTop: '8px' }}>
                <Text strong>Лучшие преподаватели</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Reports;