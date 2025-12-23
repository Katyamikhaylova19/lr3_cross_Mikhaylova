export const API_BASE_URL = 'http://localhost:5282/api';

export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User'
} as const;

export const RATING_SCORES = [1, 2, 3, 4, 5] as const;

export const GROUP_NUMBER_REGEX = /^[А-Я]{2}-\d{2}-\d{2}$/;

export const DEFAULT_PAGINATION = {
  pageSize: 10,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `${range[0]}-${range[1]} из ${total} записей`
};

export const TABLE_SCROLL = {
  x: 800,
  y: 400
};