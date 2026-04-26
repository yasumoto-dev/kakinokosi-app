import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deletePost, getPosts } from "../../api/client";

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
        } catch (error) {
            setError(err.response?.data?.detail || '削除に失敗しました')
        }
    }

    const renderPost = (post) => (
        <li key={post.postId}>
            <p>{post.nickname}</p>
            <p>{post.moodColor}</p>
            <p>{post.emotionTag}</p>
            <p>{post.text}</p>
            <p>{post.publishedAt}</p>
            {post.userUuid === userUuid && (
                <button onClick={() => handleDelete(post.postId)}>
                    削除
                </button>
            )}
        </li>
    )

    return (
        <div>
            <h1>{roomName}</h1>
            <button onClick={() => {navigate(`/`)}}>Topに戻る</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={() => navigate(`/rooms/${roomId}/posts/new`)}>
                カキノコス
            </button>

            <h2>書き残し済み</h2>
            {publishedPosts.length === 0 ? (
                <p>まだ公開済みの投稿がありません</p>
            ) : (
                <ul>{publishedPosts.map(renderPost)}</ul>
            )}  

            <h2>書き残し前（自分のみ）</h2>
            {pendingPosts.length === 0 ? (
                <p>公開前の投稿がありません</p>
            ) : (
                <ul>{pendingPosts.map(renderPost)}</ul>
            )}  
        </div>
    );
}