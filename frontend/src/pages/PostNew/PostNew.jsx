import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createPost } from '../../api/client'
import styles from './PostNew.module.css'

const COLOR_TAGS = {
    red: ['うれしい', 'ドキドキ', 'ありがとう','興奮'],
    blue: ['寂しい', '悲しい', '疲れた', '落ちつく'],
    yellow: ['楽しい', 'わくわく', '驚き', '笑った'],
    green: ['ほっとした', '癒された', '懐かしい', '穏やか'],
}

const COLOR_STYLES = {
    red: '#FF6B6B',
    blue: '#6B9FFF',
    yellow: '#FFD93D',
    green: '#6BCB77',
}

export default function PostNew() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const [moodColor, setMoodColor] = useState('')
    const [emotionTag, setEmotionTag] = useState('')
    const [text, setText] = useState('')
    const [publishTiming, setPublishTiming] = useState('immediate')
    const [error, setError] = useState('')

    const handleColorSelect = (color) => {
        setMoodColor(color)
        setEmotionTag('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const userUuid = localStorage.getItem('userUuid')
        const nickname = localStorage.getItem('nickname')
      
        if (!userUuid || !nickname) {
            setError('ルームに参加してから投稿してください')
            return
        }

        if (!moodColor) {
            setError('気分カラーを選んでください')
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
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>

                <div>
                    <label>気分カラー</label>
                    <div className={styles.colorList}>
                        {Object.entries(COLOR_STYLES).map(([color, hex]) => (
                            <div 
                                key={color}
                                onClick={() => handleColorSelect(color)}
                                className={styles.colorCircle}
                                style={{
                                    backgroundColor: hex,
                                    border: moodColor === color ? '3px solid #333' : '3px solid transparent'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {moodColor && (
                    <div>
                        <label>感情タグ</label>
                        <div className={styles.tagList}>
                            {COLOR_TAGS[moodColor].map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setEmotionTag(tag)}
                                    className={styles.tagButton}
                                    style={{
                                        backgroundColor: emotionTag === tag ? COLOR_STYLES[moodColor] : '#fff',
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <label>本文 (400文字以内) </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                        rows={4}
                    />
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