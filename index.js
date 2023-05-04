const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { MessageModel } = require('./models/Messages.model')
const { connection } = require('./configs/db');
const { userRouter } = require('./routes/user.router')

const app = express();

app.use(cors({
    origin: '*'
}))
app.use(express.json())

app.use('/users', userRouter)

const httpServer = http.createServer(app);


httpServer.listen(process.env.PORT, async () => {
    try {
        await connection;
        console.log('Connected to DB');
    } catch (error) {
        console.log('Cannot Connect to DB');
    }
    console.log(`Server is running on port ${process.env.PORT}`)
})


const io = new Server(httpServer)

io.on('connection', (socket) => {
    socket.on('join', async (user) => {
        const payload = {
            sender_id: user._id,
            username: user.username,
            text: 'Joined the Chat!',
            time: new Date()
        }
        const message = new MessageModel(payload)
        await message.save();
        socket.broadcast.emit('message', payload)
    })

    socket.on('message', async (payload) => {
        const message = new MessageModel(payload);
        await message.save();
        socket.broadcast.emit('message', payload)
    })
})