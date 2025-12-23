import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Space, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { studentApi } from '../../api/students';
import { groupApi } from '../../api/group';
import { Student, Group } from '../../types';

interface StudentFormProps {
  isEdit?: boolean;
  initialData?: Student;
  onSuccess?: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ 
  isEdit = false, 
  initialData,
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (isEdit && initialData) {
      form.setFieldsValue({
        ...initialData,
        groupNumber: initialData.group?.groupNumber
      });
    }
  }, [isEdit, initialData, form]);

  const fetchGroups = async () => {
    setGroupsLoading(true);
    try {
      const data = await groupApi.getGroupsFromStudents();
      setGroups(data);
    } catch (error) {
      message.error('Не удалось загрузить список групп');
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Находим ID группы по номеру группы
      const selectedGroup = groups.find(g => g.groupNumber === values.groupNumber);
      
      if (!selectedGroup) {
        throw new Error('Группа не найдена');
      }

      const studentData = {
        ...values,
        groupId: selectedGroup.id
      };

      // Удаляем groupNumber из данных, так как бэкенд ожидает groupId
      delete studentData.groupNumber;

      if (isEdit && id) {
        await studentApi.updateStudent(parseInt(id), studentData);
        message.success('Студент обновлен');
      } else {
        await studentApi.createStudent(studentData);
        message.success('Студент создан');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/students');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || error.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/students');
  };

  return (
    <Card title={isEdit ? 'Редактирование студента' : 'Добавление студента'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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

        <Form.Item
          name="groupNumber"
          label="Группа"
          rules={[
            { required: true, message: 'Выберите группу' }
          ]}
        >
          <Select
            placeholder="Выберите группу"
            loading={groupsLoading}
            showSearch
            optionFilterProp="children"
          >
            {groups.map(group => (
              <Select.Option key={group.id} value={group.groupNumber}>
                {group.groupNumber}
              </Select.Option>
            ))}
          </Select>
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

export default StudentForm;