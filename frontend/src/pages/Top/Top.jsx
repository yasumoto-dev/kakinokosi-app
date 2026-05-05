import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRooms } from "../../api/client";
import styles from './Top.module.css'

export default function Top() {
    const navigate = useNavigate()
    const [joinedRooms, setJoinedRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [isJoinRoomsOpen, setIsJoinRoomsOpen] = useState(false)

    const userUuid = localStorage.getItem('userUuid')

    useEffect(() => {
        fetchJoinedRooms()
    },[])

    // 参加済みルーム取得
    const fetchJoinedRooms = async () => {
        if (!userUuid) {
            setLoading(false)
            return
        }
        
        try {
            const res = await getUserRooms(userUuid)
            const rooms = res.data

            setJoinedRooms(rooms)
        } catch (err) {
            // エラー時は通常のトップ画面を表示
        } finally {
            setLoading(false)
        }
    }


    const handleRoomNew = () => {
        const nickname = localStorage.getItem('nickname')
        if(!nickname) {
            navigate('/nickname?redirect=create')
        } else {
            navigate('/rooms/new')
        }
    }

    const handleRoomJoin = () => {
        const nickname = localStorage.getItem('nickname')
        if(!nickname) {
            navigate('/nickname?redirect=join')
        } else {
            navigate('/rooms/join')
        }
    }

    if (loading) return <p>読み込み中...</p>

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>カキノコシ</h1>
            <p className={styles.subtitle}>大切な気持ちを、時間差で届けよう</p>

            {/* 参加済ルーム数により表示切り替え */}
            {joinedRooms.length > 0 && (
                <div className={styles.joinedRooms}>
                    <p className={styles.joinedRoomsLabel}>参加中のルーム</p>

                    {joinedRooms.length <= 2 ? (
                        joinedRooms.map(room => (
                            <button
                                key={room.roomId}
                                className={styles.roomButton}
                                onClick={() => navigate(`/rooms/${room.roomId}/posts`)}
                            >
                                {room.roomName}
                            </button>
                        ))
                    ) : (
                        <div>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsJoinRoomsOpen(prev => !prev)}
                            >
                                {isJoinRoomsOpen ? "▲ 閉じる" : "▼ 参加中のルームを見る"}
                            </button>

                        {isJoinRoomsOpen && (
                            joinedRooms.map(room => (
                                <button
                                    key={room.roomId}
                                    className={styles.roomButton}
                                    onClick={() => navigate(`/rooms/${room.roomId}/posts`)}
                                >
                                    {room.roomName}
                                </button>
                            ))
                        )}
                        </div>
                    )}
                </div>
            )}


            <div className={styles.buttonGroup}>
                <button className={styles.primaryButton} onClick={handleRoomNew}>
                    ルームを作成する
                </button>
                <button className={styles.secondaryButton} onClick={handleRoomJoin}>
                    ルームに参加する
                </button>
            </div>
        </div>
    );
}