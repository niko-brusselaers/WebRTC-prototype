import { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { ICall } from '../../../shared/interfaces/ICall';
import Styles  from '../css/Notification.module.scss';


function CallNotification({socket, setCall, setCallActive ,setNotification, notification, userVideo, stream, call, connectionRef}: 
    {socket:Socket, setCall: Function,setCallActive:Function, setNotification: Function,notification:string, userVideo: React.RefObject<HTMLVideoElement>, stream: MediaStream, call: ICall | undefined, connectionRef: React.MutableRefObject<Peer.Instance | null>}) {
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

        //set up event when call is closed
        peer.on('close', () => {
            setCallActive(false);
            setCall(undefined);
            // Check if the peer instance is still available
            if (connectionRef.current) {
                // Destroy the peer instance
                peer.destroy();
                connectionRef.current = null;
            }
        });

        // Check the signalingState before calling signal
            if (call) {
                peer.signal(call.signal);
                connectionRef.current = peer;
            }
        setCallActive(true);
        setNotification(undefined);
    };

    const declineCall = () => {
        setCall(undefined);
        setNotification(undefined);
    };


    return ( 
        <div className={Styles.NotificationContainer}>
            <h2>{notification}</h2> 
            <div>
                    <button onClick={acceptCall} className={Styles.acceptButton}>accept</button>
                    <button onClick={declineCall} className={Styles.declineButton}>decline</button>
            </div>
        </div>
     );
}

export default CallNotification;