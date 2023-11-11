import { FormEvent, useEffect, useState } from "react";
import { io,Socket } from "socket.io-client";
import ILoginResponse from "../../shared/interfaces/IResponses";

const socket: Socket = io("localhost:4000");

function Meeting() {
    //username usetate
    const [username, setUsername] = useState<string | undefined>();
    const [usernameInput, setUsernameInput] = useState<string | undefined>();

    //error usestate
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    const selectUsername = (event: FormEvent) => {
        event.preventDefault();
        socket.emit("login", {newUser: usernameInput});
    }

    useEffect(() => {
        socket.on('login', (data: ILoginResponse) => {
            console.log(data);
            
            if (data.statuscode === 200) {
                setUsername(data.username);
                setErrorMessage(undefined);
            } else {
                setUsername(undefined);
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
            
        </div>
     );
}

export default Meeting;