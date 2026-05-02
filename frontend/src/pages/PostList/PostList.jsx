import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deletePost, getPosts } from "../../api/client";
import styles from './PostList.module.css'

const COLOR_HEX = {
    red: '#FF6B6B',
    blue: '#6B9FFF',
    yellow: '#FFD93D',
    green: '#6BCB77',
}

export default function PostList() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const [roomName, setRoomName] = useState('')
    const [activeTab, setActiveTab] = useState('unread')
    const [unreadPosts, setUnreadPosts] = useState([])
    const [readPosts, setReadPosts] = useState([])
    const [pendingPosts, setPendingPosts] = useState([])
    const [error, setError] = useState('')

    const userUuid = localStorage.getItem('userUuid')

    const fetchPosts = async () => {
        try {
            const res = await getPosts(roomId, userUuid)
            setRoomName(res.data.roomName)

            const posts = res.data.publishedPosts

            setUnreadPosts(posts.filter(p => 
                p.userUuid !== userUuid && p.isPublished && !p.isRead
            ))
            setReadPosts(posts.filter(p => 
                p.isPublished && (p.userUuid === userUuid || p.isRead)
            ))
            setPendingPosts(posts.filter(p =>
                p.userUuid == userUuid && !p.isPublished
            ))
        } catch (err) {
            setError(err.response?.data?.detail || 'エラーが発生しました')
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [roomId])

    const formatDate = (isoString) => {
        const date = new Date(isoString)
        const now = new Date()
        const diffMs = now - date
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        if (diffHours < 24) return `${diffHours}時間前`
        if (diffDays < 7) return `${diffDays}日前`
        return `${date.getMonth() + 1}月${date.getDate()}日`
    }

     const renderEnvelopeCard = (post) => {
        const color = COLOR_HEX[post.moodColor] || '#888'
        const isYellow = post.moodColor === 'yellow'
        const textColor = isYellow ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)'
        const labelColor = isYellow ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'

        return (
            <div
                key={post.postId}
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

    const renderReadCard = (post) => {
        const color = COLOR_HEX[post.moodColor] || '#888'

        return (
            <div
                key={post.postId}
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

    const handleDelete = async (postId, e) => {
        e.stopPropagation()
        if (!window.confirm('この投稿を削除しますか？')) return
        try {
            await deletePost(roomId, postId, userUuid)
            await fetchPosts()
        } catch (err) {
            setError(err.response?.data?.detail || '削除に失敗しました')
        }
    }

    const tabs = [
    { key: 'unread',  label: '未読',  count: unreadPosts.length },
    { key: 'read',    label: '既読',  count: readPosts.length },
    { key: 'pending', label: '時間指定', count: pendingPosts.length },
    ]

    const currentPosts = {
        unread: unreadPosts,
        read: readPosts,
        pending: pendingPosts,
    }[activeTab]

    const emptyMessages = {
        unread: '未読の投稿はありません',
        read: 'まだ既読の投稿がありません',
        pending: '公開前の投稿はありません',
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{roomName}</h1>
                    <p className={styles.subtitle}>{unreadPosts.length}通の書き残し</p>
                </div>
                {unreadPosts.length > 0 && (
                    <div className={styles.unreadBadge}>
                        ● 未読 {unreadPosts.length}通
                    </div>
                )}
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* タブ */}
            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label} {tab.count}
                    </button>
                ))}
            </div>
            <hr className={styles.divider} />

            {/* 投稿リスト */}
            <div className={styles.list}>
                {currentPosts.length === 0 ? (
                    <p className={styles.empty}>{emptyMessages[activeTab]}</p>
                ) : (
                    activeTab === 'read'
                        ? currentPosts.map(renderReadCard)
                        : currentPosts.map(renderEnvelopeCard)
                )}
            </div>

            {currentPosts.length > 0 && (
                <p className={styles.allRead}>すべての書き残しを表示しました</p>
            )}

            {/* 投稿ボタン */}
            <button
                className={styles.fab}
                onClick={() => navigate(`/rooms/${roomId}/posts/new`)}
            >
                ＋
            </button>
        </div>
    )
}