import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { IUser } from './shared/interfaces/IUser';

const app = express();
const server = http.createServer(app);
const Port = process.env.PORT || 4000;
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// variable to store users
const users:IUser[] = [];

app.use(cors())

app.get('/', (req:any, res:any) => {
    res.send('webrtc backend is running')
});

server.listen(Port, () => {
    console.log(`server is running on  http://localhost:${Port}`)
});

io.on('connection', (socket: Socket) => {
    console.log("connection", socket.id);
    

    socket.on('login', (data) => {
        // check if user already exists
        if (users.find(user => user.username === data.newUser) === undefined 
            && users.find(user => user.id === socket.id) === undefined) 
        {
            // add new user to users array
            users.push(
                {
                    id: socket.id,
                    username: data.newUser
                }
            );
            let response = {
                data: "new user added",
                username: data.newUser,
                statuscode: 200,
            }
            // send response to client
            socket.emit('login', response);

        } else {
            let response = {
                data: "this username has been taken",
                statuscode: 401
            }
            // send error response to client
            socket.emit('login', response);


        }        

    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('callended')
    })

    socket.on('calluser', ({ userToCall, signalData, from, name }) => {
        console.log('calluser', userToCall, signalData, from, name);
        
        io.to(userToCall).emit('calluser', { signal: signalData, from, name })
    })

    socket.on('answercall', (data) => {
        io.to(data.to).emit('callaccepted', data.signal)
    })
})