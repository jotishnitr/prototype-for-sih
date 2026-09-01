const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
connectDB();
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header("Access-Control-Allow-Origin", origin);
    } else {
        res.header("Access-Control-Allow-Origin", "*");
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

const verifyRouter = require('./routes/verify');
const signupRouter = require('./routes/signup');
const signinRouter = require('./routes/signin');
const signoutRouter = require('./routes/signout');
const refreshRouter = require('./routes/refresh');
const getStatsRouter = require('./routes/getStats');
const getIncidentDetailsRouter = require('./routes/getIncidentDetails');
const postIncidentRouter = require('./routes/postIncident');
const postAllocateRouter = require('./routes/postAllocate');
const getResourceDetailsRouter = require('./routes/getResourceDetails');
const getResourcesRouter = require('./routes/getResources');
const getAlertsRouter = require('./routes/getAlerts');
const getResourceReadinessRouter = require('./routes/getResourceReadiness');
const postResourceRouter = require('./routes/postResource');
const autoAllocateRouter = require('./routes/autoAllocate');
const predictResourceRouter = require('./routes/predictResource');
const updateIncidentStatusRouter = require('./routes/updateIncidentStatus');
const deleteResourcesRouter = require('./routes/deleteResources');
const postJurisdictionRouter = require('./routes/postJurisdiction');
const getWeatherRouter = require('./routes/getWeather');
const getPrecautionsRouter = require('./routes/getPrecautions');
const getForecastRouter = require('./routes/getForecast');
const Jurisdiction = require('./models/Jurisdiction');

app.use('/api', verifyRouter);
app.use('/api', signupRouter);
app.use('/api', signinRouter);
app.use('/api', signoutRouter);
app.use('/api', refreshRouter);
app.use('/api', getStatsRouter);
app.use('/api', getIncidentDetailsRouter);
app.use('/api', postIncidentRouter);
app.use('/api', postAllocateRouter);
app.use('/api', getResourceDetailsRouter);
app.use('/api', getResourcesRouter);
app.use('/api', getAlertsRouter);
app.use('/api', getResourceReadinessRouter);
app.use('/api', postResourceRouter);
app.use('/api', autoAllocateRouter);
app.use('/api', predictResourceRouter);
app.use('/api', updateIncidentStatusRouter);
app.use('/api', deleteResourcesRouter);
app.use('/api', postJurisdictionRouter);
app.use('/api', getWeatherRouter);
app.use('/api', getPrecautionsRouter);
app.use('/api', getForecastRouter);

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

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
})


