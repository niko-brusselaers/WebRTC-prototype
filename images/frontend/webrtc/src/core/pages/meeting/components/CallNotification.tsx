import { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { ICall } from '../../../shared/interfaces/ICall';


function CallNotification({socket, setCall,notification, setNotification, userVideo, stream,call, connectionRef}: 
    {socket:Socket, setCall: Function,notification:string, setNotification: Function, userVideo: React.RefObject<HTMLVideoElement>, stream: MediaStream, call: ICall | undefined, connectionRef: React.MutableRefObject<Peer.Instance | null>}) {
    const acceptCall = () => {
        // Create a new SimplePeer instance for the accepted call
        const peer = new Peer({ initiator: false, trickle: false, stream });

        // Handle the signal from the accepted call
        peer.on('signal', (data) => {
            socket.emit('answerCall', { signal: data, to: call!.from });
        });

        // Set up event listeners for the peer connection
        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        // Check the signalingState before calling signal
            if (call) {
                peer.signal(call.signal);
                connectionRef.current = peer;
            }
        setNotification(undefined);
    };

    const declineCall = () => {
        setCall(undefined);
        setNotification(undefined);
    };


    return ( 
        <div>
            <p>{notification}</p> 
                <div>
                    <button onClick={acceptCall}>accept</button>
                    <button onClick={declineCall}>decline</button>
                </div>
        </div>
     );
}

export default CallNotification;