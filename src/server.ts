import app from './app.js';

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
});
