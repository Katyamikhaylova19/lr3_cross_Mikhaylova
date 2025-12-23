import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/students';
import StudentForm from '../../components/forms/StudentForm';
import { Student } from '../../types';

const EditStudent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      message.error('Не удалось загрузить данные студента');
      navigate('/students');
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
          onClick={() => navigate('/students')}
          type="text"
        >
          Назад к списку
        </Button>
        
        {student && <StudentForm isEdit initialData={student} />}
      </Space>
    </div>
  );
};

export default EditStudent;