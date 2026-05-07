import { useNavigate } from "react-router-dom"
import styles from './ReadCard.module.css'

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

export default function ReadCard({ post, userUuid, roomId, onDelete, formatDate }) {
    const navigate = useNavigate()
    
    const color = COLOR_HEX[post.moodColor] || '#888'
    const tagStyle = TAG_STYLE[post.moodColor]

    return (
        <div
            className={styles.readCard}
            onClick={() => navigate(`/rooms/${roomId}/posts/${post.postId}`)}
        >
            <div
                className={styles.readCardHeader}
                style={{backgroundColor: color}}
            >
                <span className={styles.readCardNickname}>
                    {post.nickname}
                </span>
                <span className={styles.readCardDate}>{formatDate(post.publishedAt)}</span>
            </div>

            <div className={styles.letterBody}>
                {post.emotionTag && (
                    <span
                        className={styles.tag}
                        style={tagStyle}
                    >
                        #{post.emotionTag}
                    </span>
                )}
                <p className={styles.readCardText}>{post.text}</p>
            </div>

            <div className={styles.readCardFooter}>
                <span className={styles.readCardStatus}>既読</span>
                {post.userUuid === userUuid && (
                    <div className={styles.actionWrapper}>
                        <button
                            className={styles.deleteButtonSmallDark}
                            onClick={(e) => onDelete(post.postId, e)}
                        >
                            削除
                        </button>
                        <span className={styles.readCardHeart} style={{ color: COLOR_HEX[post.moodColor] }}>
                            あなた
                        </span>
                    </div>
                )}               
            </div>
        </div>
    )
}
