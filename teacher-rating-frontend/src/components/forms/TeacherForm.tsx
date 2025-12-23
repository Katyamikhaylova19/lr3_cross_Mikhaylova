import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { teacherApi } from '../../api/teachers';
import { Teacher } from '../../types';

interface TeacherFormProps {
  isEdit?: boolean;
  initialData?: Teacher;
  onSuccess?: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ 
  isEdit = false, 
  initialData,
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      form.setFieldsValue(initialData);
    }
  }, [isEdit, initialData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isEdit && id) {
        await teacherApi.updateTeacher(parseInt(id), values);
        message.success('Преподаватель обновлен');
      } else {
        await teacherApi.createTeacher(values);
        message.success('Преподаватель создан');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/teachers');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/teachers');
  };

  return (
    <Card title={isEdit ? 'Редактирование преподавателя' : 'Добавление преподавателя'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData}
      >
        <Form.Item
          name="lastName"
          label="Фамилия"
          rules={[
            { required: true, message: 'Введите фамилию' },
            { max: 100, message: 'Максимум 100 символов' }
          ]}
        >
          <Input placeholder="Введите фамилию" />
        </Form.Item>

        <Form.Item
          name="firstName"
          label="Имя"
          rules={[
            { required: true, message: 'Введите имя' },
            { max: 100, message: 'Максимум 100 символов' }
          ]}
        >
          <Input placeholder="Введите имя" />
        </Form.Item>

        <Form.Item
          name="middleName"
          label="Отчество"
          rules={[
            { max: 100, message: 'Максимум 100 символов' }
          ]}
        >
          <Input placeholder="Введите отчество" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Сохранить' : 'Создать'}
            </Button>
            <Button onClick={handleCancel}>
              Отмена
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TeacherForm;