require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// simple health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/social', require('./routes/social'));
app.use('/api/social', require('./routes/social'));
