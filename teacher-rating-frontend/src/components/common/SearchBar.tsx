import React from 'react';
import { Input, Button, Space, Select } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface SearchBarProps {
  onSearch: (value: string) => void;
  onFilterChange?: (filter: any) => void;
  placeholder?: string;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = 'Поиск...',
  filters = [],
}) => {
  const [searchText, setSearchText] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});

  const handleSearch = (value: string) => {
    setSearchText(value);
    onSearch(value);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
      <Space wrap>
        <Search
          placeholder={placeholder}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        
        {filters.length > 0 && (
          <Space>
            <FilterOutlined />
            {filters.map(filter => (
              <Select
                key={filter.key}
                placeholder={filter.label}
                style={{ width: 150 }}
                allowClear
                onChange={(value) => handleFilterChange(filter.key, value)}
              >
                {filter.options.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            ))}
          </Space>
        )}
      </Space>
    </Space>
  );
};

export default SearchBar;