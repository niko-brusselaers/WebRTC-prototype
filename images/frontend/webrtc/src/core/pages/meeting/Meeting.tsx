import { FormEvent, useEffect, useRef, useState } from "react";
import { io,Socket } from "socket.io-client";
import * as process from 'process';
import Peer from "simple-peer";
import CallUserByNameForm from "./components/CallUserByNameForm";
import SelectUsernameForm from "./components/SelectUsernameForm";

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

//create socket connection
const socket: Socket = io("localhost:4000");

function Meeting() {
    //username usetate
    const [username, setUsername] = useState<string | undefined>();
    const [usernameInput, setUsernameInput] = useState<string | undefined>();

    //error usestate
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    //current user stream usestate and ref
    const [stream, setStream] = useState<MediaStream | undefined>(undefined);
    const myVideo = useRef<HTMLVideoElement | null>(null)

    //other user ref
    const userVideo = useRef<HTMLVideoElement | null>(null)

    //call usestate
    const [notification, setNotification] = useState<string | undefined>(undefined);
    const [usernameToCall, setUsernameToCall] = useState<string | undefined>("");
    const [call, setCall] = useState<{ from: string, name: string, signal: any } | undefined>(undefined);
    const connectionRef = useRef<Peer.Instance | null>(null);



    //select username and emit to server
    const selectUsername = (event: FormEvent) => {
        event.preventDefault();
        socket.emit("login", {newUser: usernameInput});
    }

    const acceptCall = () => {
        // Create a new SimplePeer instance for the accepted call
        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('answerCall', { signal: data, to: call!.from });
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        console.log(call);

        // Check the signalingState before calling signal
            if (call) {
                peer.signal(call.signal);
                connectionRef.current = peer;
            }

    };

    //get user media and set stream to video element
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
            setStream(currentStream);
            if (myVideo.current) {
            myVideo.current.srcObject = currentStream;
            }
        })
        .catch((error) => {
            console.error('Error accessing camera and microphone:', error);
            setErrorMessage('Error accessing camera and microphone. Please grant the necessary permissions.');
        });

    },[]);

    //listen for any incoming socket events
    useEffect(() => {


        socket.on('callAccepted', (signal) => {
            // Create a new SimplePeer instance for the accepted call
            const peer = new Peer({ initiator: true, trickle: false, stream });

            // Handle the signal from the accepted call
            peer.signal(signal);

            // Set up event listeners for the peer connection
            peer.on('stream', (currentStream) => {
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream;
                }
            });

            // Save the peer connection in the useRef for later reference
            connectionRef.current = peer;
        });

    },[]);

    
    return ( 
        <div>
            <h1>Meeting</h1>
            {
                errorMessage ? <h2>{errorMessage}</h2> : null
            }

            {errorMessage ? <p>{errorMessage}</p> : null}
            {username ? 
                <>
                <h2>Welcome {username}</h2> 
                <CallUserByNameForm 
                    username={username} connectionRef={connectionRef} 
                    setCall={setCall} setNotification={setNotification} 
                    socket={socket} stream={stream!} 
                    userVideo={userVideo}
                />
            
                </>
                
                :

                <SelectUsernameForm socket={socket} setErrorMessage={setErrorMessage} setUsername={setUsername} />
            }

            {notification ? 
            <>
                <p>{notification}</p> 
                <div>
                    <button onClick={acceptCall}>accept</button>
                </div>
            </>

            : 
            
            null
            
            }
            
            <video ref={myVideo} muted autoPlay style={{ width: "300px" }}></video>
            <video ref={userVideo} muted autoPlay style={{ width: "300px" }}></video>

        </div>
     );
}

export default Meeting;