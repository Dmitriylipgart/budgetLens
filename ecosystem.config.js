module.exports = {
  apps: [
    {
      name: 'budgetlens',
      script: './dist/server/main.js',
      instances: 1,
      max_memory_restart: '256M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
