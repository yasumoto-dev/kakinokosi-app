import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deletePost, getPosts } from "../../api/client";
import EnvelopeCard from '../../components/EnvelopeCard/EnvelopeCard'
import ReadCard from '../../components/ReadCard/ReadCard'
import styles from './PostList.module.css'

    const TABS = [
        { key: 'unread',  label: '未読' },
        { key: 'read',    label: '既読' },
        { key: 'pending', label: '時間指定' },
    ]

    const EMPTY_MESSAGES = {
        unread: '未読の投稿はありません',
        read: 'まだ既読の投稿がありません',
        pending: '公開前の投稿はありません',
    }

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

    // 表示用データ
    const postsByTab = {
        unread: unreadPosts,
        read: readPosts,
        pending: pendingPosts,
    }
    const currentPosts = postsByTab[activeTab]

    const tabs = TABS.map(tab => ({
        ...tab,
        count: postsByTab[tab.key].length,
    }))

    // 共通props
    const cardProps = { userUuid, roomId, onDelete: handleDelete, formatDate }

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
                    <p className={styles.empty}>{EMPTY_MESSAGES[activeTab]}</p>
                ) : (
                    activeTab === 'read'
                        ? currentPosts.map(post => <ReadCard key={post.postId} post={post} {...cardProps} />)
                        : currentPosts.map(post => <EnvelopeCard key={post.postId} post={post} {...cardProps} />)
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