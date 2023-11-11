# changelog

## [0.0.1] 

### Added

    created starter files of frontend and created:
        -Meeting component
        -SocketService service
        -interface file for all responses
    
    created starter files of backend to get initial backend websockets working for frontend

## [0.0.2]

### added

    frontend:

        - functionality to choose username and save it to backend,
        - functionality to get user video and audio and display it

## [0.0.3]

### added

    frontend:

        - functionality to call other user by username
        - functionality to answer call

### fixed

    frontend:

        - fixed bug where user who initated call would get error about process not being defined

## [0.0.4]

## added

    backend:

        - websocket login:
            - checks if username is avaible
            - stores username in server variable
            - sends response to frontend
## changed

    backend:

        - websocket disconnect:
            - now removes user data when user disconnects
        - websocket callUser:
            - finds userId of user who is being called
            - send error message to original caller if user is not found
        - websocket answerCall:
            - finds userId of user who is being called

## [0.0.5]

### changed

    frontend:

        - moved following functionality to its own component:
            - selectUsername
            - callUser
            - answerCall
            - errorMessage
### added

    frontend:

        added styling to components:
            - Meeting
            - SelectUsername
            - CallUser
            - Notification
            - ErrorMessage
