module.exports = {
  apps: [
    {
      name: "gwe-fe-cms", // Tên ứng dụng trong PM2
      script: "yarn", // File chính của API (thay bằng file của bạn, ví dụ: app.js)
      args: "start",
      instances: 1, // Số lượng instance (1 cho đơn giản, hoặc "max" để dùng hết CPU)
      exec_mode: "fork", // Chế độ chạy (fork hoặc cluster, fork là đủ cho API cơ bản)
      autorestart: true, // Tự động restart khi crash
      max_restarts: 5, // Giới hạn 5 lần restart liên tục
      restart_delay: 5000, // Chờ 5 giây trước khi restart
      watch: false, // Tắt watch mặc định (sẽ bật riêng cho Git)
      env: {
        NODE_ENV: "production", // Môi trường production
        PORT: 3000, // Cổng API chạy (thay nếu cần)
      },
      env_development: {
        NODE_ENV: "development", // Môi trường dev (tùy chọn)
      },
    },
  ],
};
