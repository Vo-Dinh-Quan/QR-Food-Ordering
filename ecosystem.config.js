// lệnh deploy: pm2 deploy ecosystem.config.js production

module.exports = {
  apps: [
    {
      name: "next-app", // Tên ứng dụng
      script: "npm", // Sử dụng npm làm script runner
      args: "start", // Chạy lệnh npm start
      env: {
        NODE_ENV: "production",
        PORT: 3000, // Cổng chạy ứng dụng
        NEXT_PUBLIC_API_URL: "https://localhost:3000", // Biến môi trường
      },
      instances: "max", // Sử dụng tối đa CPU
      exec_mode: "cluster", // Chế độ cluster
      watch: false, // Tắt watch trong production
      max_memory_restart: "1G", // Tự động restart nếu sử dụng quá 1GB memory
      error_file: "./logs/next-error.log", // Đường dẫn file log lỗi
      out_file: "./logs/next-out.log", // File log output
      merge_logs: true,
      autorestart: true,
    },
  ],

  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/main", // Giả sử dùng branch main
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
      "pre-deploy-local": "",
      "post-deploy": `
        npm install &&
        npm run build &&
        pm2 reload ecosystem.config.js --env production
      `,
      "pre-setup": "",
      env: {
        NODE_ENV: "production",
      },
    },
  },
};
