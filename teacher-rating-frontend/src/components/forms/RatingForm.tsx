import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Space, Rate, Select, Switch } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ratingApi } from '../../api/ratings';
import { teacherApi } from '../../api/teachers';
import { studentApi } from '../../api/students';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { Rating as RatingType, Teacher } from '../../types';

interface RatingFormProps {
  isEdit?: boolean;
  initialData?: RatingType;
  onSuccess?: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({ 
  isEdit = false, 
  initialData,
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const { currentStudent } = useCurrentStudent();

  useEffect(() => {
    if (isEdit && initialData) {
      form.setFieldsValue(initialData);
    }
  }, [isEdit, initialData, form]);

  useEffect(() => {
    fetchAvailableTeachers();
  }, [currentStudent]);

  const fetchAvailableTeachers = async () => {
    if (!currentStudent) return;
    
    setTeachersLoading(true);
    try {
      // Получаем преподавателей группы студента
      const teachers = await teacherApi.getTeachersByGroup(currentStudent.groupId);
      setAvailableTeachers(teachers);
    } catch (error) {
      message.error('Не удалось загрузить список преподавателей');
      console.error('Error fetching teachers:', error);
    } finally {
      setTeachersLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const studentId = currentStudent?.id || 1;
      
      if (isEdit && id) {
        await ratingApi.updateRating(parseInt(id), values, studentId);
        message.success('Оценка обновлена');
      } else {
        // Проверяем, не оценивал ли уже студент этого преподавателя
        const existingRatings = await ratingApi.getRatingsByStudent(studentId);
        const alreadyRated = existingRatings.some(r => r.teacherId === values.teacherId);
        
        if (alreadyRated) {
          throw new Error('Вы уже оценили этого преподавателя');
        }
        
        await ratingApi.createRating(values, studentId);
        message.success('Оценка создана');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/ratings');
      }
    } catch (error: any) {
      message.error(error.message || error.response?.data?.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/ratings');
  };

  return (
    <Card title={isEdit ? 'Редактирование оценки' : 'Добавление оценки'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="teacherId"
          label="Преподаватель"
          rules={[
            { required: true, message: 'Выберите преподавателя' }
          ]}
        >
          <Select
            placeholder="Выберите преподавателя"
            loading={teachersLoading}
            disabled={isEdit || teachersLoading}
            showSearch
            optionFilterProp="children"
          >
            {availableTeachers.map(teacher => (
              <Select.Option key={teacher.id} value={teacher.id}>
                {teacher.lastName} {teacher.firstName} {teacher.middleName || ''}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="score"
          label="Оценка"
          rules={[
            { required: true, message: 'Поставьте оценку' },
            {
              validator: (_, value) => 
                value && value >= 1 && value <= 5 ? 
                Promise.resolve() : 
                Promise.reject(new Error('Оценка должна быть от 1 до 5'))
            }
          ]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          name="review"
          label="Отзыв"
          rules={[
            { max: 1000, message: 'Максимум 1000 символов' }
          ]}
        >
          <Input.TextArea 
            placeholder="Введите отзыв (необязательно)" 
            rows={4}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="isAnonymous"
          label="Анонимно"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch checkedChildren="Да" unCheckedChildren="Нет" />
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

export default RatingForm;