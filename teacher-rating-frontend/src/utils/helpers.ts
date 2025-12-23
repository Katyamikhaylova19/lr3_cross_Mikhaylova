import { Student, Teacher, Rating } from '../types';

export const formatFullName = (
  lastName: string, 
  firstName: string, 
  middleName?: string
): string => {
  return `${lastName} ${firstName} ${middleName || ''}`.trim();
};

export const getInitials = (
  lastName: string, 
  firstName: string, 
  middleName?: string
): string => {
  return `${lastName} ${firstName[0]}.${middleName ? ` ${middleName[0]}.` : ''}`;
};

export const calculateAverageRating = (ratings: Rating[]): number => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((total, rating) => total + rating.score, 0);
  return Number((sum / ratings.length).toFixed(2));
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const validateGroupNumber = (groupNumber: string): boolean => {
  const regex = /^[А-Я]{2}-\d{2}-\d{2}$/;
  return regex.test(groupNumber);
};

export const getRatingColor = (score: number): string => {
  switch (score) {
    case 5:
      return '#52c41a'; // green
    case 4:
      return '#a0d911'; // lime
    case 3:
      return '#faad14'; // orange
    case 2:
      return '#fa8c16'; // dark orange
    case 1:
      return '#f5222d'; // red
    default:
      return '#d9d9d9'; // gray
  }
};