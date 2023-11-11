import express from 'express'
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const Port = process.env.PORT || 3000;
const io = new Server(server)

app.use(cors())

app.get('/', (req:Response, res:any) => {
    res.send('webrtc backend is running')
});

server.listen(Port, () => {
    console.log(`server is running on  http://localhost:${Port}`)
});

io.on('connection', (socket: Socket) => {

    socket.emit('me', socket.id)

    socket.on('disconnect', () => {
        socket.broadcast.emit('callended')
    })

    socket.on('calluser', ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit('calluser', { signal: signalData, from, name })
    })

    socket.on('answercall', (data) => {
        io.to(data.to).emit('callaccepted', data.signal)
    })
})