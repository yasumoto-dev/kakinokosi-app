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

            <div className={styles.readCardTextWrapper}>
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
