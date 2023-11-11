import { io } from "socket.io-client";
// import Peer from "simple-peer";

const BACKEND_URL = 'http://localhost:3000';

const socket = io(BACKEND_URL);

class SocketService {
    
}

export const socketService = new SocketService();