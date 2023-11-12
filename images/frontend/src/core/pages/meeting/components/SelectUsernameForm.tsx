import { useState } from "react";
import { Socket } from "socket.io-client";
import ILoginResponse from "../../../shared/interfaces/IResponses";
import styles from "../css/Form.module.scss";

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
        <div className={styles.formContainer}>
            <h2>please enter your username</h2>
            <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Enter your name" onChange={(e) => setUsernameInput(e.target.value)} />
                        <button type="submit">Submit</button>
            </form>

        </div>
     );
}

export default SelectUsernameForm;