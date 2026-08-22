const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const http = require('http')
const { Server } = require('http');

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
const postAllocateRouter = require('./routes/postAllocate');
const getResourceDetailsRouter = require('./routes/getResourceDetails');
const getAlertsRouter = require('./routes/getAlerts');
const getResourceReadinessRouter = require('./routes/getResourceReadiness');
const postResourceRouter = require('./routes/postResource');
const autoAllocateRouter = require('./routes/autoAllocate');
const updateIncidentStatusRouter = require('./routes/updateIncidentStatus');
const deleteResourcesRouter = require('./routes/deleteResources');
const Jurisdiction = require('./models/Jurisdiction');

app.use('/api', signupRouter);
app.use('/api', signinRouter);
app.use('/api', signoutRouter);
app.use('/api', refreshRouter);
app.use('/api', getStatsRouter);
app.use('/api', getIncidentDetailsRouter);
app.use('/api', postIncidentRouter);
app.use('/api', postAllocateRouter);
app.use('/api', getResourceDetailsRouter);
app.use('/api', getAlertsRouter);
app.use('/api', getResourceReadinessRouter);
app.use('/api', postResourceRouter);
app.use('/api', autoAllocateRouter);
app.use('/api', updateIncidentStatusRouter);
app.use('/api', deleteResourcesRouter);

app.get('/', (req, res) => res.send('ResQNet API running'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", method: ['GET', 'POST'] }
})
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Client connected', socket.id);

    socket.on('join:jurisdiction', (jurisdiction_id) => {
        socket.join(`jurisdiction:${jurisdiction_id}`);
        console.log(`Socket ${socket.id} joined jurisdiction :${jurisdiction_id}`)
    })

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`)
    })
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

