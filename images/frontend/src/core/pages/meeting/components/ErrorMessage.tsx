import styles from '../css/Notification.module.scss'

function ErrorMessage({errorMessage}:{errorMessage:string}) {
    return ( 
        <div className={styles.alertContainer}>
                <h2>{errorMessage}</h2>
        </div> 
     );
}

export default ErrorMessage;