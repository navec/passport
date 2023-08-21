import app from './app';

const port = process.env.PORT || 3030;

// Start
app.listen(port, () =>
  console.log(`Your application started on http://localhost:${port}`)
);

export default app;
