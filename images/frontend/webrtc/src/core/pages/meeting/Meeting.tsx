import { FormEvent, useEffect, useRef, useState } from "react";
import { io,Socket } from "socket.io-client";
import * as process from 'process';
import Peer from "simple-peer";
import CallUserByNameForm from "./components/CallUserByNameForm";
import SelectUsernameForm from "./components/SelectUsernameForm";
import CallNotification from "./components/CallNotification";
import { ICall } from "../../shared/interfaces/ICall";

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

//create socket connection
const socket: Socket = io("localhost:4000");

function Meeting() {
    //username usetate
    const [username, setUsername] = useState<string | undefined>();

    //error usestate
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    //current user stream usestate and ref
    const [stream, setStream] = useState<MediaStream | undefined>(undefined);
    const myVideo = useRef<HTMLVideoElement | null>(null)

    //other user ref
    const userVideo = useRef<HTMLVideoElement | null>(null)

    //call usestate
    const [notification, setNotification] = useState<string | undefined>(undefined);
    const [call, setCall] = useState<ICall | undefined>(undefined);
    const connectionRef = useRef<Peer.Instance | null>(null);
    

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

    
    return ( 
        <div>
            
            <h2>{errorMessage ? errorMessage : null}</h2>

            {username ? 
                <>
                    <h2>Welcome {username}</h2> 
                    <CallUserByNameForm username={username} 
                     setCall={setCall} setNotification={setNotification} 
                     socket={socket} stream={stream!} userVideo={userVideo}
                    />
                </>
                
                :

                <SelectUsernameForm socket={socket} 
                 setErrorMessage={setErrorMessage} setUsername={setUsername} 
                />
            }

            {notification ? 
            <CallNotification call={call} 
             connectionRef={connectionRef} stream={stream!}
             notification={notification} setCall={setCall} 
             setNotification={setNotification} socket={socket} 
             userVideo={userVideo}
            />
            :
            null
            
            }
            
            <video ref={myVideo} muted autoPlay style={{ width: "300px" }}></video>
            <video ref={userVideo} muted autoPlay style={{ width: "300px" }}></video>

        </div>
     );
}

export default Meeting;