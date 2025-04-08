const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB连接成功'));

app.use('/api', authRoutes);
app.use('/api', uploadRoutes);

app.listen(5000, () => console.log('服务器运行在 http://localhost:5000'));