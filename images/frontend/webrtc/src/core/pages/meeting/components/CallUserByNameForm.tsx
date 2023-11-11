import { useState } from "react";
import { Socket } from "socket.io-client";
import Peer from "simple-peer";
import styles from "../css/Form.module.scss";

function CallUserByNameForm({ socket, userVideo, username, stream, setCall, setNotification }: 
    { socket: Socket, userVideo: React.RefObject<HTMLVideoElement>, username: string, stream: MediaStream, setCall: Function,setNotification: Function}) {
    const [usernameToCall, SetUsernameToCall] = useState<string|undefined>(undefined);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (usernameToCall) {
            // Create a new SimplePeer instance for the call
            const peer = new Peer({ initiator: true, trickle: false, stream });

            //on signal, send signal to server
            peer.on('signal', (data) => {
                socket.emit('callUser', { userToCall: usernameToCall, signalData: data, from: username });
                setCall({ from: username!, name: usernameToCall, signal: data });
            });

            //on stream, set stream to userVideo
            peer.on('stream', (currentStream) => {
                console.log("stream");
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream;
                }
            });

            //on callaccepted, signal to server that call is accepted and send signal to other user
            socket.on('callAccepted', (signal) => {
                peer.signal(signal);
            });
        }
    };

    socket.on('callUser', (data:any) => {
            // set the call data to state
            setCall({ from: data.from, name: username!, signal: data.signal })
            // set the notification data to state
            setNotification(`You have a call from ${data.from}`);
            
        });

        

    return (
        <div className={styles.formContainer}>
            <h2>please enter the username of who you like to call</h2>

            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Enter username" onChange={(e) => SetUsernameToCall(e.target.value)}/>
                <button type="submit"  >Call</button>
            </form>
        </div>
        
     );
}

export default CallUserByNameForm;