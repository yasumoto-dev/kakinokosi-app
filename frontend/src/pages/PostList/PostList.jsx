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

            // 未読条件
            setUnreadPosts(posts.filter(p => 
                p.userUuid !== userUuid && p.isPublished && !p.isRead
            ))
            // 既読条件
            setReadPosts(posts.filter(p => 
                p.isPublished && (p.userUuid === userUuid || p.isRead)
            ))
            // 公開前条件
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

    const handleDelete = async (postId) => {
        if (!window.confirm('この投稿を削除しますか？')) return
        try {
            await deletePost(roomId, postId, userUuid)
            await fetchPosts()
        } catch (err) {
            setError(err.response?.data?.detail || '削除に失敗しました')
        }
    }

    const renderPost = (post) => (
        <li 
            key={post.postId} 
            className={styles.postCard}
            onClick={() => navigate(`/rooms/${roomId}/posts/${post.postId}`)}
            styles={{ cursor: 'pointer' }}
        >
            <div className={styles.postHeader}>
                <div
                    className={styles.colorDot}
                    style={{backgroundColor: COLOR_HEX[post.moodColor]}}
                />
                <span className={styles.nickname}>{post.nickname}</span>
                {post.emotionTag && (
                    <span
                        className={styles.emotionTag}
                        style={{ backgroundColor: COLOR_HEX[post.moodColor] }}
                    >
                        {post.emotionTag}
                    </span>
                )}
            </div>
            <p className={styles.postText}>{post.text}</p>
            <div className={styles.postFooter}>
                <span className={styles.publishedAt}>{post.publishedAt}</span>
                {post.userUuid === userUuid && (
                    <button 
                        className={styles.deleteButton}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(post.postId)
                        }}
                    >
                        削除
                    </button>
                )}
            </div>
        </li>
    )

    const tabs = [
        { key: 'unread', label: `未読 ${unreadPosts.length > 0 ? `(${unreadPosts.length})` : ''}` },
        { key: 'read', label: '既読' },
        { key: 'pending', label: '公開前' },
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
                <h1 className={styles.title}>{roomName}</h1>
                <button 
                    className={styles.postButton}
                    onClick={() => navigate(`/rooms/${roomId}/posts/new`)}
                >
                    投稿する
                </button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className={styles.section}>
                {currentPosts.length === 0 ? (
                    <p>{emptyMessages[activeTab]}</p>
                ) : (
                    <ul>{currentPosts.map(renderPost)}</ul>
                )}
            </div>
        </div>
    );
}