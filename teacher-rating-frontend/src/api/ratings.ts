import api from './auth';
import { Rating } from '../types';

export const ratingApi = {
  // CRUD операции
  getAllRatings: async (): Promise<Rating[]> => {
    const response = await api.get('/ratings');
    return response.data;
  },

  getRatingById: async (id: number): Promise<Rating> => {
    const response = await api.get(`/ratings/${id}`);
    return response.data;
  },

  getRatingsByTeacher: async (teacherId: number): Promise<Rating[]> => {
    const response = await api.get(`/ratings/teacher/${teacherId}`);
    return response.data;
  },

  getRatingsByStudent: async (studentId: number): Promise<Rating[]> => {
    const response = await api.get(`/ratings/student/${studentId}`);
    return response.data;
  },

  getMyRatings: async (): Promise<Rating[]> => {
    const response = await api.get('/ratings/my-ratings');
    return response.data;
  },

  createRating: async (rating: Omit<Rating, 'id' | 'createdDate'>, studentId: number): Promise<Rating> => {
    const response = await api.post('/ratings', rating);
    return response.data;
  },

  updateRating: async (id: number, rating: Partial<Rating>, studentId: number): Promise<Rating> => {
    const response = await api.put(`/ratings/${id}`, { ...rating, studentId });
    return response.data;
  },

  deleteRating: async (id: number, studentId: number): Promise<void> => {
    await api.delete(`/ratings/${id}`);
  },

  // Специфичные операции
  getHighRated: async (studentId: number): Promise<any[]> => {
    const response = await api.get('/ratings/high-rated');
    return response.data;
  },

  // Вспомогательные методы
  calculateAverageRating: (ratings: Rating[]): number => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + rating.score, 0);
    return Number((sum / ratings.length).toFixed(2));
  },

  getRatingSummary: async (teacherId: number): Promise<{
    average: number;
    count: number;
    distribution: Record<number, number>;
  }> => {
    const ratings = await ratingApi.getRatingsByTeacher(teacherId);
    
    const distribution: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    
    ratings.forEach(rating => {
      distribution[rating.score] = (distribution[rating.score] || 0) + 1;
    });

    return {
      average: ratingApi.calculateAverageRating(ratings),
      count: ratings.length,
      distribution
    };
  },

  validateRating: (rating: Partial<Rating>): string[] => {
    const errors: string[] = [];
    
    if (!rating.score || rating.score < 1 || rating.score > 5) {
      errors.push('Оценка должна быть от 1 до 5');
    }
    
    if (rating.review && rating.review.length > 1000) {
      errors.push('Отзыв не должен превышать 1000 символов');
    }
    
    if (!rating.teacherId) {
      errors.push('Не выбран преподаватель');
    }

    return errors;
  },
};