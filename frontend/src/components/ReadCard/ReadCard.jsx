import { useNavigate } from "react-router-dom"
import styles from './ReadCard.module.css'

const COLOR_HEX = {
    red: '#FF6B6B',
    blue: '#6B9FFF',
    yellow: '#FFD93D',
    green: '#6BCB77',
}

export default function ReadCard({ post, userUuid, roomId, onDelete, formatDate }) {
    const navigate = useNavigate()
    
    const color = COLOR_HEX[post.moodColor] || '#888'

    return (
        <div
            className={styles.readCard}
            style={{ borderLeftColor: color }}
            onClick={() => navigate(`/rooms/${roomId}/posts/${post.postId}`)}
        >
            <div className={styles.readCardHeader}>
                <span className={styles.readCardNickname} style={{ color }}>
                    {post.nickname}
                </span>
                <span className={styles.readCardDate}>{formatDate(post.publishedAt)}</span>
            </div>
            <p className={styles.readCardText}>{post.text}</p>
            <div className={styles.readCardFooter}>
                <span className={styles.readCardStatus}>既読</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {post.userUuid === userUuid && (
                        <button
                            className={styles.deleteButtonSmallDark}
                            onClick={(e) => handleDelete(post.postId, e)}
                        >
                            削除
                        </button>
                    )}
                    <span className={styles.readCardHeart} style={{ color: COLOR_HEX[post.moodColor] }}>
                        あなた
                    </span>
                </div>
            </div>
        </div>
    )
}
