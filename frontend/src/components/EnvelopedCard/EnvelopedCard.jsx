import { useNavigate } from "react-router-dom"
import styles from './EnvelopeCard.module.css'

const COLOR_HEX = {
    red: '#FF6B6B',
    blue: '#6B9FFF',
    yellow: '#FFD93D',
    green: '#6BCB77',
}

export default function EnvelopedCard({ post, userUuid, roomId, onDelete, formatDelete }) {
    const navigate = useNavigate()
    
    const color = COLOR_HEX[post.moodColor] || '#888'
    const isYellow = post.moodColor === 'yellow'
    const textColor = isYellow ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)'
    const labelColor = isYellow ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'

    return (
        <div
            className={styles.envelopeCard}
            style={{ backgroundColor: color }}
            onClick={() => navigate(`/rooms/${roomId}/posts/${post.postId}`)}
        >
            {/* 封筒の折り目 */}
            <div className={styles.envelopeFold} style={{ borderBottomColor: color }}>
                <div className={styles.envelopeHeart} style={{ color: textColor }}>♡</div>
            </div>

            {/* 封筒アイコン＋テキスト */}
            <div className={styles.envelopeCenter}>
                <div className={styles.envelopeIcon} style={{ color: textColor }}>⊠</div>
                <span className={styles.envelopeLabel} style={{ color: textColor }}>
                    開封して読む
                </span>
            </div>

            {/* フッター */}
            <div className={styles.envelopeFooter}>
                <span style={{ color: labelColor, fontSize: 13 }}>
                    {post.userUuid === userUuid ? '時間指定' : '未読'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}> 
                    {post.userUuid === userUuid && (
                        <button
                            className={styles.deleteButtonSmall}
                            onClick={(e) => handleDelete(post.postId, e)}
                        >
                            削除
                        </button>
                    )}
                    <span style={{ color: labelColor, fontSize: 13 }}>
                        {formatDate(post.publishedAt)}
                    </span>
                </div>
            </div>

            {/* 送信者 */}
            <div className={styles.envelopeSender} style={{ color: textColor }}>
                {post.nickname}
            </div>
        </div>
    )
}