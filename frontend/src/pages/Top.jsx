import { useNavigate } from "react-router-dom";

export default function Top() {
    const navigate = useNavigate()

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


    return (
        <div>
            <h1>カキノコシ</h1>
            <p>大切な気持ちを、時間差で届けよう</p>
            <button onClick={handleRoomNew}>
                ルームを作成する
            </button>
            <button onClick={handleRoomJoin}>
                ルームに参加する
            </button>
        </div>
    );
}