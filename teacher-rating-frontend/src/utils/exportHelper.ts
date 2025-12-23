export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    return;
  }

  // Получаем заголовки из ключей первого объекта
  const headers = Object.keys(data[0]);
  
  // Создаем CSV строку
  let csvString = headers.join(',') + '\n';
  
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      // Обработка специальных символов
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvString += row.join(',') + '\n';
  });

  // Создаем blob и скачиваем файл
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: any[], filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatDataForExport = (data: any[], columns: any[]) => {
  return data.map(item => {
    const formattedItem: any = {};
    columns.forEach(column => {
      if (column.dataIndex) {
        formattedItem[column.title] = item[column.dataIndex];
      } else if (column.key && column.render) {
        // Для колонок с рендером нужно обработать по-особому
        formattedItem[column.title] = 'Н/Д';
      }
    });
    return formattedItem;
  });
};