import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPosts } from "../api/client";

export default function PostList() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const [roomName, setRoomName] = useState('')
    const [posts, setPosts] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await getPosts(roomId)
                setRoomName(res.data.roomName)
                setPosts(res.data.publishedPosts)
            } catch (err) {
                setError(err.response?.data?.detail || 'エラーが発生しました')
            }
        }
        fetchPosts()
    }, [roomId])

    return (
        <div>
            <h1>{roomId}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={() => navigate(`/rooms/${roomId}/posts/new`)}>
                投稿を作成する
            </button>
            {posts.length === 0 ? (
                <p>まだ投稿がありません</p>
            ) : (
                <ul>
                    {posts.map((post) => (
                        <li key={post.postId}>
                            <p>{post.nickname}</p>
                            <p>{post.text}</p>
                            <p>{post.moodColor}</p>
                            <p>{post.emotionTag}</p>
                            <p>{post.publishedAt}</p>
                        </li>
                    ))}
                </ul>
            )}    
        </div>
    );
}