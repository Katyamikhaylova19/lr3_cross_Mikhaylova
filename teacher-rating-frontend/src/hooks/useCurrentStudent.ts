import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../api/students';
import { Student } from '../types';

export const useCurrentStudent = () => {
  const { user } = useAuth();
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentStudent = async () => {
      if (!user) {
        setCurrentStudent(null);
        setLoading(false);
        return;
      }

      try {
        // В реальном приложении здесь нужно получать ID студента из токена или контекста
        // Для демо используем студента с ID 1
        const student = await studentApi.getStudentById(1);
        setCurrentStudent(student);
      } catch (err) {
        console.error('Error fetching current student:', err);
        setError('Не удалось загрузить данные студента');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentStudent();
  }, [user]);

  return { currentStudent, loading, error };
};