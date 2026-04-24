import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinRoom } from '../../api/client'

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
        <div>
            <h1>ルームに参加する</h1>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ルームID</label>
                    <input value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
                </div>
                <div>
                    <label>アクセスキー</label>
                    <input value={accessKey} onChange={(e) => setAccessKey(e.target.value)} required />
                </div>
                <button type="submit">参加する</button>
            </form>
        </div>
    )
}