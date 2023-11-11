import { useState } from "react";
import { Socket } from "socket.io-client";
import ILoginResponse from "../../../shared/interfaces/IResponses";

function SelectUsernameForm({ socket, setUsername, setErrorMessage }: { socket: Socket, setUsername: Function, setErrorMessage: Function }) {
    
    const [usernameInput, setUsernameInput] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();        
        socket.emit('login', { newUser: usernameInput });
    };

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


    return ( 
        <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Enter your name" onChange={(e) => setUsernameInput(e.target.value)} />
                    <button type="submit">Submit</button>
        </form>
     );
}

export default SelectUsernameForm;