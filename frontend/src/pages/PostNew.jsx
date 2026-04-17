import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createPost } from '../api/client'

export default function PostNew() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const [moodColor, setMoodColor] = useState('')
    const [emotionTag, setEmotionTag] = useState('')
    const [text, setText] = useState('')
    const [publishTiming, setPublishTiming] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const userUuid = localStorage.getItem('userUuid')
        const nickname = localStorage.getItem('nickname')
      
        if (!userUuid || !nickname) {
            setError('ルームに参加してから投稿してください')
            return
        }

        // ↓ここから実装する
        try {
            const res = await joinRoom(roomId, { accessKey, userUuid, nickname })
            localStorage.setItem('nickname', nickname)
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
                <div>
                    <label>ニックネーム</label>
                    <input value={nickname} onChange={(e) => setNickname(e.target.value)} required />
                </div>
                <button type="submit">参加する</button>
            </form>
        </div>
    )
}