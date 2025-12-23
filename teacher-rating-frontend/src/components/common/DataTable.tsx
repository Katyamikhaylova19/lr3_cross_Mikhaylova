import React from 'react';
import { Table, TableProps } from 'antd';

interface DataTableProps<T> extends TableProps<T> {
  data: T[];
  loading?: boolean;
  viewMode?: 'table' | 'cards';
}

function DataTable<T extends object>({ 
  data, 
  loading = false, 
  viewMode = 'table',
  ...tableProps 
}: DataTableProps<T>) {
  
  // Если режим карточек, пока временно возвращаем таблицу
  if (viewMode === 'cards') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {data.map((item, index) => (
          <div key={index} style={{ 
            border: '1px solid #d9d9d9', 
            borderRadius: '8px',
            padding: '16px',
            width: '300px'
          }}>
            {/* Рендер карточки через children или специальный render */}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table<T>
      dataSource={data}
      loading={loading}
      rowKey={(record: any) => record.id || record.key}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} из ${total} записей`
      }}
      {...tableProps}
    />
  );
}

export default DataTable;