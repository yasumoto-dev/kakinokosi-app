import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinRoom } from '../../api/client'
import styles from './RoomJoin.module.css'

export default function RoomJoin() {
    const navigate = useNavigate()
    const [roomId, setRoomId] = useState('')
    const [accessKey, setAccessKey] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const res = await joinRoom(roomId, { accessKey })
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
            <h1 className={styles.title}>ルームに参加する</h1>
            {error && <p style={{color: 'red'}}>{error}</p>}
        
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>ルームID</label>
                    <input
                        className={styles.input}
                        value={roomId} 
                        onChange={(e) => setRoomId(e.target.value)} 
                        required 
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>アクセスキー (4文字以上) </label>
                    <input 
                        className={styles.input} 
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)} 
                        required 
                    />
                </div>
                <button className={styles.submitButton} type="submit">
                    参加する
                </button>
            </form>
        </div>
    )
}