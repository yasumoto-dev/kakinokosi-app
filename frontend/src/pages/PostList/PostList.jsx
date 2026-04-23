import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPosts } from "../../api/client";

export default function PostList() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const [roomName, setRoomName] = useState('')
    const [publishedPosts, setPublishedPosts] = useState([])
    const [pendingPosts, setPendingPosts] = useState([])
    const [error, setError] = useState('')

    //　roomId変更時に動作
    useEffect(() => {
        const fetchPosts = async () => {
            const userUuid = localStorage.getItem('userUuid')
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
        fetchPosts()
    }, [roomId])

    return (
        <div>
            <h1>{roomName}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={() => navigate(`/rooms/${roomId}/posts/new`)}>
                投稿を作成する
            </button>

            <h2>公開済み</h2>
            {publishedPosts.length === 0 ? (
                <p>まだ公開済みの投稿がありません</p>
            ) : (
                <ul>
                    {publishedPosts.map((post) => (
                        <li key={post.postId}>
                            <p>{post.nickname}</p>
                            <p>{post.moodColor}</p>
                            <p>{post.emotionTag}</p>
                            <p>{post.text}</p>
                            <p>{post.publishedAt}</p>
                        </li>
                    ))}
                </ul>
            )}  

            <h2>公開前（自分のみ）</h2>
            {pendingPosts.length === 0 ? (
                <p>公開前の投稿がありません</p>
            ) : (
                <ul>
                    {pendingPosts.map((post) => (
                        <li key={post.postId}>
                            <p>{post.nickname}</p>
                            <p>{post.moodColor}</p>
                            <p>{post.emotionTag}</p>
                            <p>{post.text}</p>
                            <p>{post.publishedAt}</p>
                        </li>
                    ))}
                </ul>
            )}  

        </div>
    );
}