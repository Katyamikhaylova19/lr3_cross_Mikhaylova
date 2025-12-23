import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Modal, 
  message, 
  Row, 
  Col,
  Switch,
  Tag,
  Avatar,
  Rate,
  Select
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ratingApi } from '../../api/ratings';
import { teacherApi } from '../../api/teachers';
import { studentApi } from '../../api/students';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import { Rating as RatingType, Teacher, Student } from '../../types';
import type { TableColumnType } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const RatingsPage: React.FC = () => {
  const [ratings, setRatings] = useState<RatingType[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<RatingType[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const { user, isAdmin } = useAuth();
  const { currentStudent } = useCurrentStudent();
  const navigate = useNavigate();

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      let data: RatingType[];
      if (isAdmin) {
        // Для админа получаем все оценки
        data = await ratingApi.getAllRatings();
      } else {
        // Для студента получаем только его оценки
        const studentId = currentStudent?.id || 1;
        data = await ratingApi.getRatingsByStudent(studentId);
      }
      setRatings(data);
      setFilteredRatings(data);
    } catch (error) {
      message.error('Не удалось загрузить список оценок');
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, currentStudent]);

  const fetchTeachersAndStudents = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [teachersData, studentsData] = await Promise.all([
        teacherApi.getAllTeachers(),
        studentApi.getAllStudents()
      ]);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching teachers and students:', error);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchRatings();
    if (isAdmin) {
      fetchTeachersAndStudents();
    }
  }, [fetchRatings, fetchTeachersAndStudents, isAdmin]);

  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) {
      setFilteredRatings(ratings);
      return;
    }

    const filtered = ratings.filter(rating =>
      rating.teacher?.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      rating.teacher?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      rating.student?.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      rating.student?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      rating.review?.toLowerCase().includes(searchText.toLowerCase()) ||
      false
    );
    setFilteredRatings(filtered);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    let filtered = [...ratings];

    if (filters.teacher) {
      filtered = filtered.filter(rating => 
        rating.teacher?.id.toString() === filters.teacher
      );
    }

    if (filters.student) {
      filtered = filtered.filter(rating => 
        rating.student?.id.toString() === filters.student
      );
    }

    if (filters.score) {
      filtered = filtered.filter(rating => 
        rating.score.toString() === filters.score
      );
    }

    setFilteredRatings(filtered);
  };

  const handleDelete = async (id: number, studentId: number) => {
    Modal.confirm({
      title: 'Удалить оценку?',
      content: 'Это действие нельзя отменить.',
      okText: 'Удалить',
      cancelText: 'Отмена',
      okType: 'danger',
      onOk: async () => {
        try {
          await ratingApi.deleteRating(id, studentId);
          message.success('Оценка удалена');
          fetchRatings();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Не удалось удалить оценку');
        }
      },
    });
  };

  const columns: TableColumnType<RatingType>[] = [
    {
      title: 'Преподаватель',
      key: 'teacher',
      render: (_: any, record: RatingType) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: '#1890ff' }}
            icon={<TeamOutlined />}
          />
          <div>
            <Text strong>{record.teacher?.lastName} {record.teacher?.firstName[0]}.</Text>
            <br />
            <Text type="secondary">{record.teacher?.middleName || ''}</Text>
          </div>
        </Space>
      ),
      sorter: (a: RatingType, b: RatingType) => 
        (a.teacher?.lastName || '').localeCompare(b.teacher?.lastName || ''),
    },
    {
      title: 'Студент',
      key: 'student',
      render: (_: any, record: RatingType) => (
        record.isAnonymous ? 
          <Text type="secondary">Аноним</Text> : 
          <Space>
            <Avatar 
              style={{ backgroundColor: '#52c41a' }}
              icon={<UserOutlined />}
            />
            <div>
              <Text strong>{record.student?.lastName} {record.student?.firstName[0]}.</Text>
              <br />
              <Text type="secondary">{record.student?.group?.groupNumber || ''}</Text>
            </div>
          </Space>
      ),
      sorter: (a: RatingType, b: RatingType) => {
        if (a.isAnonymous && b.isAnonymous) return 0;
        if (a.isAnonymous) return -1;
        if (b.isAnonymous) return 1;
        return (a.student?.lastName || '').localeCompare(b.student?.lastName || '');
      },
    },
    {
      title: 'Оценка',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => <Rate disabled defaultValue={score} />,
      sorter: (a: RatingType, b: RatingType) => a.score - b.score,
    },
    {
      title: 'Отзыв',
      key: 'review',
      render: (_: any, record: RatingType) => 
        record.review ? (
          <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {record.review}
          </div>
        ) : (
          <Text type="secondary">Нет отзыва</Text>
        ),
    },
    {
      title: 'Дата',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: RatingType, b: RatingType) => 
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: RatingType) => {
        const currentUserId = currentStudent?.id || 1;
        const canModify = isAdmin || record.student?.id === currentUserId;
        
        return (
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/ratings/${record.id}`)}
              type="text"
            />
            {canModify && (
              <>
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(`/ratings/edit/${record.id}`)}
                  type="text"
                />
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDelete(record.id, currentUserId)}
                  type="text"
                />
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {filteredRatings.map(rating => {
        const currentUserId = currentStudent?.id || 1;
        const canModify = isAdmin || rating.student?.id === currentUserId;
        
        return (
          <Col key={rating.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={
                <Space>
                  <Rate disabled defaultValue={rating.score} />
                  <Text strong>{rating.score}</Text>
                </Space>
              }
              extra={
                <Space>
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => navigate(`/ratings/${rating.id}`)}
                  />
                  {canModify && (
                    <Button 
                      icon={<EditOutlined />} 
                      size="small"
                      onClick={() => navigate(`/ratings/edit/${rating.id}`)}
                    />
                  )}
                </Space>
              }
              actions={canModify ? [
                <DeleteOutlined 
                  key="delete" 
                  onClick={() => handleDelete(rating.id, currentUserId)}
                  style={{ color: '#ff4d4f' }}
                />
              ] : []}
            >
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">Преподаватель:</Text>
                <br />
                <Text strong>
                  {rating.teacher?.lastName} {rating.teacher?.firstName[0]}.
                  {rating.teacher?.middleName ? ` ${rating.teacher.middleName[0]}.` : ''}
                </Text>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">Студент:</Text>
                <br />
                {rating.isAnonymous ? (
                  <Text type="secondary">Аноним</Text>
                ) : (
                  <Text>
                    {rating.student?.lastName} {rating.student?.firstName[0]}.
                  </Text>
                )}
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">Группа:</Text>
                <br />
                <Tag color="blue" style={{ fontSize: '12px' }}>
                  {rating.student?.group?.groupNumber || 'Не указана'}
                </Tag>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">Отзыв:</Text>
                <br />
                <Text>
                  {rating.review ? 
                    `${rating.review.substring(0, 50)}${rating.review.length > 50 ? '...' : ''}` : 
                    'Нет отзыва'
                  }
                </Text>
              </div>
              
              <div>
                <Text type="secondary">Дата:</Text>
                <br />
                <Text>{new Date(rating.createdDate).toLocaleDateString()}</Text>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const searchFilters = isAdmin ? [
    {
      key: 'teacher',
      label: 'Преподаватель',
      options: teachers.map(t => ({
        value: t.id.toString(),
        label: `${t.lastName} ${t.firstName[0]}.`
      }))
    },
    {
      key: 'student',
      label: 'Студент',
      options: students.map(s => ({
        value: s.id.toString(),
        label: `${s.lastName} ${s.firstName[0]}.`
      }))
    },
    {
      key: 'score',
      label: 'Оценка',
      options: [1, 2, 3, 4, 5].map(score => ({
        value: score.toString(),
        label: `${score} звезд`
      }))
    }
  ] : [];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Оценки</Title>
        </Col>
        <Col>
          <Space>
            <Text>Режим просмотра:</Text>
            <Switch
              checkedChildren="Карточки"
              unCheckedChildren="Таблица"
              checked={viewMode === 'cards'}
              onChange={(checked) => setViewMode(checked ? 'cards' : 'table')}
            />
            {!isAdmin && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/ratings/new')}
              >
                Добавить оценку
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <SearchBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        placeholder="Поиск по преподавателю, студенту или отзыву..."
        filters={searchFilters}
      />

      {viewMode === 'table' ? (
        <DataTable
          data={filteredRatings}
          columns={columns}
          loading={loading}
        />
      ) : (
        renderCardView()
      )}
    </div>
  );
};

export default RatingsPage;