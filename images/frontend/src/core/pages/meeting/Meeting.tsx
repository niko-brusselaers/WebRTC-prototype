import { useEffect, useRef, useState } from "react";
import { io,Socket } from "socket.io-client";
import * as process from 'process';
import Peer from "simple-peer";
import CallUserByNameForm from "./components/CallUserByNameForm";
import SelectUsernameForm from "./components/SelectUsernameForm";
import CallNotification from "./components/CallNotification";
import { ICall } from "../../shared/interfaces/ICall";
import styles from "./css/Meeting.module.scss";
import ErrorMessage from "./components/ErrorMessage";

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

//create socket connection
const socket: Socket = io(process.env.BACKEND_URL!);

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
    const [callActive, setCallActive] = useState<boolean>(false);
    

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

    useEffect(() => {
            window.addEventListener('beforeunload', (event) => {
                if(connectionRef.current){
                    connectionRef.current.end();
                    connectionRef.current.destroy();
                }
            });
    });
    
    return ( 
        <div className={styles.meetingContainer}>
            
            {errorMessage ? <ErrorMessage errorMessage={errorMessage}/>
            
            : 
            null}

            {notification ? 
            <CallNotification call={call} 
             connectionRef={connectionRef} stream={stream!}
             notification={notification} setCall={setCall} 
             setNotification={setNotification} socket={socket} 
             userVideo={userVideo} setCallActive={setCallActive}
            />
            :
            null
            
            }

            <div className={styles.videoContainer}>
                <video ref={myVideo} muted autoPlay className={callActive ? styles.PictureInPictureVideo : styles.overlayVideo}></video>
                <video ref={userVideo} muted autoPlay className={callActive ? styles.overlayVideo : styles.hiddenVideo}></video>
            </div>

            {username ? 
                <>
                    <CallUserByNameForm username={username} 
                     setCall={setCall} setNotification={setNotification} 
                     socket={socket} stream={stream!} userVideo={userVideo}
                     setCallActive={setCallActive} connectionRef={connectionRef}
                    />
                </>
                
                :

                <SelectUsernameForm socket={socket} 
                 setErrorMessage={setErrorMessage} setUsername={setUsername} 
                />
            }

            
            
            

        </div>
     );
}

export default Meeting;