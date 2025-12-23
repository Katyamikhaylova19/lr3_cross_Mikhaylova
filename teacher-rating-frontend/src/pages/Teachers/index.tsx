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
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  TeamOutlined,
  StarFilled 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teacherApi } from '../../api/teachers';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import { Teacher } from '../../types';

const { Title, Text } = Typography;

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teacherApi.getAllTeachers();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (error) {
      message.error('Не удалось загрузить список преподавателей');
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    const filtered = teachers.filter(teacher =>
      teacher.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      teacher.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      teacher.middleName?.toLowerCase().includes(searchText.toLowerCase()) ||
      false
    );
    setFilteredTeachers(filtered);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Удалить преподавателя?',
      content: 'Все оценки этого преподавателя также будут удалены. Это действие нельзя отменить.',
      okText: 'Удалить',
      cancelText: 'Отмена',
      okType: 'danger',
      onOk: async () => {
        try {
          await teacherApi.deleteTeacher(id);
          message.success('Преподаватель удален');
          fetchTeachers();
        } catch (error) {
          message.error('Не удалось удалить преподавателя');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ФИО',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Teacher) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: '#1890ff' }}
            icon={<TeamOutlined />}
          />
          <div>
            <Text strong>{`${record.lastName} ${record.firstName}`}</Text>
            <br />
            <Text type="secondary">{record.middleName || ''}</Text>
          </div>
        </Space>
      ),
      sorter: (a: Teacher, b: Teacher) => 
        a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'Средний рейтинг',
      key: 'averageRating',
      render: (_: any, record: Teacher) => {
        const avg = record.ratings && record.ratings.length > 0
          ? record.ratings.reduce((sum, r) => sum + r.score, 0) / record.ratings.length
          : 0;
        
        return (
          <Space>
            <StarFilled style={{ color: avg >= 4 ? '#ffc107' : '#d9d9d9' }} />
            <Text strong>{avg.toFixed(2)}</Text>
            <Text type="secondary">({record.ratings?.length || 0} оценок)</Text>
          </Space>
        );
      },
      sorter: (a: Teacher, b: Teacher) => {
        const avgA = a.ratings && a.ratings.length > 0
          ? a.ratings.reduce((sum, r) => sum + r.score, 0) / a.ratings.length
          : 0;
        const avgB = b.ratings && b.ratings.length > 0
          ? b.ratings.reduce((sum, r) => sum + r.score, 0) / b.ratings.length
          : 0;
        return avgA - avgB;
      },
    },
    {
      title: 'Группы',
      key: 'groups',
      render: (_: any, record: Teacher) => (
        <Space wrap>
          {record.teacherGroups?.slice(0, 3).map(tg => (
            <Tag key={tg.id} color="blue">
              {tg.group?.groupNumber}
            </Tag>
          ))}
          {record.teacherGroups && record.teacherGroups.length > 3 && (
            <Tag>+{record.teacherGroups.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Teacher) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/teachers/${record.id}`)}
            type="text"
          />
          {isAdmin && (
            <>
              <Button 
                icon={<EditOutlined />} 
                onClick={() => navigate(`/teachers/edit/${record.id}`)}
                type="text"
              />
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDelete(record.id)}
                type="text"
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {filteredTeachers.map(teacher => {
        const avgRating = teacher.ratings && teacher.ratings.length > 0
          ? teacher.ratings.reduce((sum, r) => sum + r.score, 0) / teacher.ratings.length
          : 0;
        
        return (
          <Col key={teacher.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={
                <Space>
                  <Avatar icon={<TeamOutlined />} />
                  <span>{teacher.lastName} {teacher.firstName[0]}.</span>
                </Space>
              }
              extra={
                <Space>
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                  />
                  {isAdmin && (
                    <Button 
                      icon={<EditOutlined />} 
                      size="small"
                      onClick={() => navigate(`/teachers/edit/${teacher.id}`)}
                    />
                  )}
                </Space>
              }
              actions={isAdmin ? [
                <DeleteOutlined 
                  key="delete" 
                  onClick={() => handleDelete(teacher.id)}
                  style={{ color: '#ff4d4f' }}
                />
              ] : []}
            >
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">Отчество:</Text>
                <br />
                <Text>{teacher.middleName || 'не указано'}</Text>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">Рейтинг:</Text>
                <br />
                <Space>
                  <StarFilled style={{ color: avgRating >= 4 ? '#ffc107' : '#d9d9d9' }} />
                  <Text strong>{avgRating.toFixed(2)}</Text>
                  <Text type="secondary">({teacher.ratings?.length || 0} оценок)</Text>
                </Space>
              </div>
              
              <div>
                <Text type="secondary">Группы:</Text>
                <br />
                <Space wrap>
                  {teacher.teacherGroups?.map(tg => (
                    <Tag key={tg.id} color="blue" style={{ fontSize: '12px' }}>
                      {tg.group?.groupNumber}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Преподаватели</Title>
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
            {isAdmin && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/teachers/new')}
              >
                Добавить преподавателя
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Поиск преподавателей по ФИО..."
      />

      {viewMode === 'table' ? (
        <DataTable
          data={filteredTeachers}
          columns={columns}
          loading={loading}
        />
      ) : (
        renderCardView()
      )}
    </div>
  );
};

export default TeachersPage;