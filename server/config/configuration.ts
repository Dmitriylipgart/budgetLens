export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  appMode: process.env.APP_MODE || 'single_user',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  database: {
    path: process.env.DB_PATH || './data/budgetlens.db',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    defaultUserEmail: process.env.DEFAULT_USER_EMAIL || 'owner@local',
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'claude',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.AI_MODEL || 'claude-haiku-4-5-20251001',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '16000', 10),
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './data/uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
});
