module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "https://api.binrestaurant.io.vn", // Cập nhật URL backend
      },
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      error_file: "./logs/next-error.log",
      out_file: "./logs/next-out.log",
      merge_logs: true,
      autorestart: true,
    },
  ],
  deploy: {
    production: {
      user: "prod", // Thay bằng user SSH thực tế của bạn
      host: "103.140.249.51", // IP VPS của bạn
      ref: "origin/main",
      repo: "git@github.com:Vo-Dinh-Quan/QR-Food-Ordering.git", // Thay bằng repo thực tế của frontend
      path: "/home/prod/QR-Food-Ordering", // Đường dẫn thực tế trên VPS
      "pre-deploy-local": "",
      "post-deploy": `
        npm install &&
        npm run build &&
        pm2 reload ecosystem.config.js --env production
      `,
      "pre-setup": "mkdir -p logs", // Tạo thư mục logs nếu chưa có
      env: {
        NODE_ENV: "production",
      },
    },
  },
};
