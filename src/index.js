import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config();
const app = express();

connectDB();

app.get('/', (req, res) => {
    res.json('Welcome Benson');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

