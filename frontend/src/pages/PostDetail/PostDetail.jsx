import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPost } from "../../api/client";
import styles from './PostDetail.module.css'

const COLOR_HEX = {
    red: '#FF6B6B',
    blue: '#6B9FFF',
    yellow: '#FFD93D',
    green: '#6BCB77',
}

const TAG_STYLE = {
    red:    { color: '#c94040', borderColor: '#c94040', background: 'rgba(255,107,107,0.1)' },
    blue:   { color: '#3a6fd8', borderColor: '#3a6fd8', background: 'rgba(107,159,255,0.1)' },
    yellow: { color: '#a07800', borderColor: '#a07800', background: 'rgba(255,217,61,0.15)' },
    green:  { color: '#2a7a3a', borderColor: '#2a7a3a', background: 'rgba(107,203,119,0.1)' },
}

const STAMP_COLOR = {
    yellow: '#a07800',
}

const formatDetailDate = (isoString) => {
    const date = new Date(isoString + 'Z')
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}/${m}/${d}`
}

export default function PostDetail() {
    const { roomId, postId } = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState(null)
    const [error, setError] = useState('')

    const userUuid = localStorage.getItem('userUuid')

    const fetchPost = async () => {
        try {
            const res = await getPost(roomId, postId, userUuid)
            setPost(res.data)
        } catch (err) {
            setError(err.response?.data?.detail || 'エラーが発生しました')
        }
    }
    useEffect(() => {
        fetchPost()
    },[roomId, postId])

    if (error) return <p style={{color: 'red' }}>{error}</p>
    if (!post) return <p >読み込み中...</p>

    const envelopeColor = COLOR_HEX[post.moodColor]
    const tagStyle = TAG_STYLE[post.moodColor]
    const stampColor = STAMP_COLOR[post.moodColor] || 'white'

    return (
        <div className={styles.page}>
            <button
                className={styles.backButton}
                onClick={() => navigate(`/rooms/${roomId}/posts`)}
            >
                ← 戻る
            </button>

            {/* 封筒 */}
            <div
                className={styles.envelope}
                style={{ backgroundColor: envelopeColor }}
            >
                <span
                    className={styles.sender}
                    style={{ color: stampColor }}
                >
                    {post.nickname} より
                </span>
                <div
                    className={styles.stamp}
                    style={{
                        borderColor: `rgba(${stampColor === 'white' ? '255,255,255' : '160,120,0'},0.6)`,
                        color: stampColor
                    }}
                >
                    ✉
                </div>
            </div>

            {/* 手紙本文 */}
            <div className={styles.letterBody}>
                {post.emotionTag && (
                    <span
                        className={styles.tag}
                        style={tagStyle}
                    >
                        #{post.emotionTag}
                    </span>
                )}
                <p className={styles.text}>{post.text}</p>
                <div className={styles.date}>{formatDetailDate(post.publishedAt)}</div>
            </div>
        </div>
    );
}