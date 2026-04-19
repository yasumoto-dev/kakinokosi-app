import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom } from '../api/client'

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

        const userUuid = localStorage.getItem('userUuid') || crypto.randomUUID()
        localStorage.setItem('userUuid', userUuid)

        try {
            const res = await createRoom({ roomId, roomName, accessKey, userUuid, nickname })
            localStorage.setItem('nickname', nickname)
            navigate(`/rooms/${res.data.roomId}/posts`)
        } catch (err) {
            setError(err.response?.data?.detail || 'エラーが発生しました')
        }
    }

    return (
        <div>
            <h1>ルームを作成する</h1>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ルームID</label>
                    <input value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
                </div>
                <div>
                    <label>ルーム名</label>
                    <input value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
                </div>
                <div>
                    <label>アクセスキー</label>
                    <input value={accessKey} onChange={(e) => setAccessKey(e.target.value)} required />
                </div>
                <button type="submit">作成する</button>
            </form>
        </div>
    )
}