export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Пароль должен содержать минимум 6 символов');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру');
  }
  
  return errors;
};

export const validateGroupNumber = (groupNumber: string): boolean => {
  const regex = /^[А-Я]{2}-\d{2}-\d{2}$/;
  return regex.test(groupNumber);
};

export const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100;
};

export const validateRating = (score: number): boolean => {
  return score >= 1 && score <= 5;
};

export const validateReview = (review: string): boolean => {
  return review.length <= 1000;
};