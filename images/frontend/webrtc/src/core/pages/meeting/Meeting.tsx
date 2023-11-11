import { FormEvent, useEffect, useRef, useState } from "react";
import { io,Socket } from "socket.io-client";
import Peer from "simple-peer";
import ILoginResponse from "../../shared/interfaces/IResponses";

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

    const callUser = (event: FormEvent) => {
        event.preventDefault();
        if (usernameToCall) {
            console.log("make call");
        
            const peer = new Peer({ initiator: true, trickle: false, stream });

            peer.on('signal', (data) => {
                socket.emit('callUser', { userToCall: usernameToCall, signalData: data, from: username });
                setCall({ from: username!, name: usernameToCall, signal: data });
            });

            peer.on('stream', (currentStream) => {
                console.log("stream");
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream;
                }
            });

            socket.on('callAccepted', (signal) => {
                // Move this line after setting up the 'signal' event listener
                peer.signal(signal);
            });

            connectionRef.current = peer;
        }
    };

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

        //listen for login event
        socket.on('login', (data: ILoginResponse) => {
            
            //if statuscode is 200, set username and clear possibel error message
            if (data.statuscode === 200) {
                setUsername(data.username);
                setErrorMessage(undefined);
            } else {
                //if statuscode is not 200, set and display error message
                setErrorMessage(data.data)
            }
        });

        socket.on('callUser', (data:any) => {
            // set the call data to state
            setCall({ from: data.from, name: username!, signal: data.signal })
            // set the notification data to state
            setNotification(`You have a call from ${data.from}`);
            
        });

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

            {username ? 
                <>
                <h2>Welcome {username}</h2> 
            
                <form onSubmit={callUser}>
                    <input type="text" placeholder="Enter username" onChange={(e) => setUsernameToCall(e.target.value)}/>
                    <button type="submit"  >Call</button>
                </form>
                </>
                : 
                <form onSubmit={selectUsername}>
                        <input type="text" placeholder="Enter your name" onChange={(e) => setUsernameInput(e.target.value)} />
                        <button type="submit">Submit</button>
                </form>
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