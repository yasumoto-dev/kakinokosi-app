import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom } from '../../api/client'
import styles from './RoomNew.module.css'

export default function RoomNew() {
    const navigate = useNavigate()
    const [roomId, setRoomId] = useState('')
    const [roomName, setRoomName] = useState('')
    const [accessKey, setAccessKey] = useState('')
    const [nickname, setNickname] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const userUuid = localStorage.getItem('userUuid')
        const nickname = localStorage.getItem('nickname')

        try {
            const res = await createRoom({ roomId, roomName, accessKey, userUuid, nickname })
            navigate(`/rooms/${res.data.roomId}/posts`)
        } catch (err) {
            setError(err.response?.data?.detail || 'エラーが発生しました')
        }
    }

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(`/`)}>
                ← 戻る
            </button>
            <h1 className={styles.title}>ルームを作成する</h1>
            <p className={styles.subtitle}>二人だけの空間をつくりましょう</p>
            {error && <p style={{color: 'red'}}>{error}</p>}

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>ルームID</label>
                    <input
                        className={styles.input}
                        value={roomId} 
                        placeholder='ex) 1111'
                        onChange={(e) => setRoomId(e.target.value)} 
                        required 
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>ルーム名</label>
                    <input 
                        className={styles.input}
                        value={roomName} 
                        placeholder='ex) Kakinokosi'
                        onChange={(e) => setRoomName(e.target.value)} 
                        required 
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>アクセスキー (4文字以上) </label>
                    <input 
                        className={styles.input} 
                        value={accessKey}
                        placeholder='ex) 1111' 
                        onChange={(e) => setAccessKey(e.target.value)} 
                        required 
                    />
                </div>
                <button className={styles.submitButton} type="submit">
                    作成する
                </button>
            </form>
        </div>
    )
}