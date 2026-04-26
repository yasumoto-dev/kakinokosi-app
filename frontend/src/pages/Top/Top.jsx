import { useNavigate } from "react-router-dom";
import styles from './Top.module.css'

export default function Top() {
    const navigate = useNavigate()

    const handleRoomNew = () => {
        const nickname = localStorage.getItem('nickname')
        if(!nickname) {
            navigate('/nickname?redirect=create')
        } else {
            navigate('/rooms/new')
        }
    }

    const handleRoomJoin = () => {
        const nickname = localStorage.getItem('nickname')
        if(!nickname) {
            navigate('/nickname?redirect=join')
        } else {
            navigate('/rooms/join')
        }
    }


    return (
        <div className={styles.container}>
            <h1 className={styles.title}>カキノコシ</h1>
            <p className={styles.subtitle}>大切な気持ちを、時間差で届けよう</p>
            <div className={styles.buttonGroup}>
                <button className={styles.primaryButton} onClick={handleRoomNew}>
                    ルームを作成する
                </button>
                <button className={styles.secondaryButton} onClick={handleRoomJoin}>
                    ルームに参加する
                </button>
            </div>
        </div>
    );
}