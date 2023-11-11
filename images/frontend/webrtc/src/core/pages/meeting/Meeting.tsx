import { FormEvent, useEffect, useRef, useState } from "react";
import { io,Socket } from "socket.io-client";
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


    //select username and emit to server
    const selectUsername = (event: FormEvent) => {
        event.preventDefault();
        socket.emit("login", {newUser: usernameInput});
    }

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

    },[]);

    
    return ( 
        <div>
            <h1>Meeting</h1>
            {
                errorMessage ? <h2>{errorMessage}</h2> : null
            }

            {username ? 
            
                <h2>Welcome {username}</h2> 
                : 
                <form onSubmit={selectUsername}>
                        <input type="text" placeholder="Enter your name" onChange={(e) => setUsernameInput(e.target.value)} />
                        <button type="submit">Submit</button>
                </form>
            }
            
            <video ref={myVideo} muted autoPlay style={{ width: "300px" }}></video>

        </div>
     );
}

export default Meeting;