import './config/env.js';
import { env } from './config/env.js';
import app from './app.js';

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Health check: http://localhost:${env.PORT}/api/v1/health`);
});
