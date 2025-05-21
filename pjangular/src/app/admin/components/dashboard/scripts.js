// Dữ liệu giả cho bảng người dùng
const users = [
  { id: 1, name: 'Nguyễn Văn A' },
  { id: 2, name: 'Trần Thị B' },
  { id: 3, name: 'Lê Văn C' },
];

// Biểu đồ người dùng
const userChart = new Chart(document.getElementById('userChart'), {
  type: 'bar',
  data: {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'],
    datasets: [{
      label: 'Số lượng người dùng',
      data: [120, 190, 150, 220, 300],
      backgroundColor: '#3b82f6',
      borderRadius: 8,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// Biểu đồ doanh thu
const revenueChart = new Chart(document.getElementById('revenueChart'), {
  type: 'line',
  data: {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'],
    datasets: [{
      label: 'Doanh thu (triệu VNĐ)',
      data: [5, 10, 8, 15, 20],
      borderColor: '#10b981',
      fill: true,
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.4,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});
