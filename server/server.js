const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
dotenv.config();
connectDB();
app.use(express.json());
app.use(cookieParser());

const signupRouter = require('./routes/signup');
const signinRouter = require('./routes/signin');
const signoutRouter = require('./routes/signout');
const refreshRouter = require('./routes/refresh');
const getStatsRouter = require('./routes/getStats');
const getIncidentDetailsRouter = require('./routes/getIncidentDetails');
const postIncidentRouter = require('./routes/postIncident');

app.use('/api', signupRouter);
app.use('/api', signinRouter);
app.use('/api', signoutRouter);
app.use('/api', refreshRouter);
app.use('/api', getStatsRouter);
app.use('/api', getIncidentDetailsRouter);
app.use('/api', postIncidentRouter);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

