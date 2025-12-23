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
  Select
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../api/students';
import { groupApi } from '../../api/group';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import { Student, Group } from '../../types';
import type { ColumnsType } from 'antd/es/table'; 

type ColumnType<RecordType> = ColumnsType<RecordType>[number];
type OnFilterValueType<RecordType> = Parameters<NonNullable<ColumnType<RecordType>['onFilter']>>[0];

const { Title, Text } = Typography;
const { Option } = Select;

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentApi.getAllStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      message.error('Не удалось загрузить список студентов');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const groupsData = await groupApi.getGroupsFromStudents();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, [fetchStudents, fetchGroups]);

  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.middleName?.toLowerCase().includes(searchText.toLowerCase()) ||
      false
    );
    setFilteredStudents(filtered);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    let filtered = [...students];

    if (filters.group) {
      filtered = filtered.filter(student => 
        student.group?.groupNumber === filters.group
      );
    }

    setFilteredStudents(filtered);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Удалить студента?',
      content: 'Все оценки этого студента также будут удалены. Это действие нельзя отменить.',
      okText: 'Удалить',
      cancelText: 'Отмена',
      okType: 'danger',
      onOk: async () => {
        try {
          await studentApi.deleteStudent(id);
          message.success('Студент удален');
          fetchStudents();
        } catch (error) {
          message.error('Не удалось удалить студента');
        }
      },
    });
  };

  // Используйте правильный тип для колонок
  const columns: ColumnsType<Student> = [
    {
      title: 'ФИО',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Student) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: '#52c41a' }}
            icon={<UserOutlined />}
          />
          <div>
            <Text strong>{`${record.lastName} ${record.firstName}`}</Text>
            <br />
            <Text type="secondary">{record.middleName || ''}</Text>
          </div>
        </Space>
      ),
      sorter: (a: Student, b: Student) => 
        a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'Группа',
      key: 'group',
      dataIndex: 'group', // Добавьте dataIndex
      render: (group: Student['group'], record: Student) => (
        <Tag color="blue">
          {record.group?.groupNumber || 'Не указана'}
        </Tag>
      ),
      filters: groups.map(group => ({
        text: group.groupNumber,
        value: group.groupNumber,
      })),
      onFilter: (value: OnFilterValueType<Student>, record: Student) => {
        return record.group?.groupNumber === String(value);
    },
    },
    {
      title: 'Количество оценок',
      key: 'ratingsCount',
      dataIndex: 'ratings', // Добавьте dataIndex
      render: (ratings: Student['ratings'], record: Student) => (
        <Text>{record.ratings?.length || 0}</Text>
      ),
      sorter: (a: Student, b: Student) => 
        (a.ratings?.length || 0) - (b.ratings?.length || 0),
    },
    {
      title: 'Средняя оценка',
      key: 'averageRating',
      dataIndex: 'ratings', // Добавьте dataIndex
      render: (ratings: Student['ratings'], record: Student) => {
        const avg = record.ratings && record.ratings.length > 0
          ? record.ratings.reduce((sum, r) => sum + r.score, 0) / record.ratings.length
          : 0;
        
        return (
          <Text strong>{avg.toFixed(2)}</Text>
        );
      },
      sorter: (a: Student, b: Student) => {
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
      title: 'Действия',
      key: 'actions',
      render: (text: string, record: Student) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/students/${record.id}`)}
            type="text"
          />
          {isAdmin && (
            <>
              <Button 
                icon={<EditOutlined />} 
                onClick={() => navigate(`/students/edit/${record.id}`)}
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
      {filteredStudents.map(student => {
        const avgRating = student.ratings && student.ratings.length > 0
          ? student.ratings.reduce((sum, r) => sum + r.score, 0) / student.ratings.length
          : 0;
        
        return (
          <Col key={student.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <span>{student.lastName} {student.firstName[0]}.</span>
                </Space>
              }
              extra={
                <Space>
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => navigate(`/students/${student.id}`)}
                  />
                  {isAdmin && (
                    <Button 
                      icon={<EditOutlined />} 
                      size="small"
                      onClick={() => navigate(`/students/edit/${student.id}`)}
                    />
                  )}
                </Space>
              }
              actions={isAdmin ? [
                <DeleteOutlined 
                  key="delete" 
                  onClick={() => handleDelete(student.id)}
                  style={{ color: '#ff4d4f' }}
                />
              ] : []}
            >
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">Отчество:</Text>
                <br />
                <Text>{student.middleName || 'не указано'}</Text>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">Группа:</Text>
                <br />
                <Tag color="blue">
                  {student.group?.groupNumber || 'Не указана'}
                </Tag>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <Text type="secondary">Оценок:</Text>
                <br />
                <Text>{student.ratings?.length || 0}</Text>
              </div>
              
              <div>
                <Text type="secondary">Средняя оценка:</Text>
                <br />
                <Text strong>{avgRating.toFixed(2)}</Text>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const searchFilters = [
    {
      key: 'group',
      label: 'Группа',
      options: groups.map(g => ({
        value: g.groupNumber,
        label: g.groupNumber
      }))
    }
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Студенты</Title>
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
                onClick={() => navigate('/students/new')}
              >
                Добавить студента
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <SearchBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        placeholder="Поиск студентов по ФИО..."
        filters={searchFilters}
      />

      {viewMode === 'table' ? (
        <DataTable
          data={filteredStudents}
          columns={columns}
          loading={loading}
        />
      ) : (
        renderCardView()
      )}
    </div>
  );
};

export default StudentsPage;