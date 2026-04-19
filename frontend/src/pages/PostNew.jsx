import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createPost } from '../api/client'

export default function PostNew() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const [moodColor, setMoodColor] = useState('')
    const [emotionTag, setEmotionTag] = useState('')
    const [text, setText] = useState('')
    const [publishTiming, setPublishTiming] = useState('immediate')
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

        try {
            await createPost(roomId, { userUuid, nickname, moodColor, emotionTag, text, publishTiming })
            navigate(`/rooms/${roomId}/posts`)
        } catch (err) {
            setError(err.response?.data?.detail || 'エラーが発生しました')
        }
    }

    return (
        <div>
            <h1>投稿を作成する</h1>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>気分カラー</label>
                    <input value={moodColor} onChange={(e) => setMoodColor(e.target.value)} required />
                </div>
                <div>
                    <label>感情タグ</label>
                    <input value={emotionTag} onChange={(e) => setEmotionTag(e.target.value)} required />
                </div>
                <div>
                    <label>本文 (400文字以内) </label>
                    <textarea value={text} onChange={(e) => setText(e.target.value)} required />
                </div>
                <div>
                    <label>公開タイミング</label>
                    <select value={publishTiming} onChange={(e) => setPublishTiming(e.target.value)}>
                        <option value="immediate">今すぐ</option>
                        <option value="today_22">当日22:00</option>
                        <option value="tomorrow_10">翌日10:00</option>
                    </select>
                </div>
                <button type="submit">投稿する</button>
            </form>
        </div>
    )
}