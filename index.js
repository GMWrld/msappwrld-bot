require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sneakersRoutes = require('./routes/sneakers.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/sneakers', sneakersRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Sneaker API is running 👟');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
