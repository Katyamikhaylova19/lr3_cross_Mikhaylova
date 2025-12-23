import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teachers';
import TeacherForm from '../../components/forms/TeacherForm';
import { Teacher } from '../../types';

const EditTeacher: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      message.error('Не удалось загрузить данные преподавателя');
      navigate('/teachers');
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
          onClick={() => navigate('/teachers')}
          type="text"
        >
          Назад к списку
        </Button>
        
        {teacher && <TeacherForm isEdit initialData={teacher} />}
      </Space>
    </div>
  );
};

export default EditTeacher;