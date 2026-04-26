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
    const [publishedPosts, setPublishedPosts] = useState([])
    const [pendingPosts, setPendingPosts] = useState([])
    const [error, setError] = useState('')

    const userUuid = localStorage.getItem('userUuid')

    const fetchPosts = async () => {
        try {
            const res = await getPosts(roomId, userUuid)
            setRoomName(res.data.roomName)

            // 公開済み・公開前投稿を選別
            const posts = res.data.publishedPosts
            setPublishedPosts(posts.filter((p) => p.isPublished))
            setPendingPosts(posts.filter((p) => !p.isPublished))
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
        <li key={post.postId} className={styles.postCard}>
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
                        onClick={() => handleDelete(post.postId)}
                    >
                        削除
                    </button>
                )}
            </div>
        </li>
    )

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


            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>公開済み</h2>
                {publishedPosts.length === 0 ? (
                    <p>まだ公開済みの投稿がありません</p>
                ) : (
                    <ul>{publishedPosts.map(renderPost)}</ul>
                )}
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>公開前（自分のみ）</h2>
                {pendingPosts.length === 0 ? (
                    <p>公開前の投稿がありません</p>
                ) : (
                    <ul>{pendingPosts.map(renderPost)}</ul>
                )}
            </div>
        </div>
    );
}