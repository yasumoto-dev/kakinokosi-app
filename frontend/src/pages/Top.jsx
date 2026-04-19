import { useNavigate } from "react-router-dom";

export default function Top() {
    const navigate = useNavigate()

    return (
        <div>
            <h1>カキノコシ</h1>
            <p>大切な気持ちを、時間差で届けよう</p>
            <button onClick={() => navigate('/rooms/new')}>
                ルームを作成する
            </button>
            <button onClick={() => navigate('/rooms/join')}>
                ルームに参加する
            </button>
        </div>
    );
}