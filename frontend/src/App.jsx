import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Top from './pages/Top'
import NicknameNew from './pages/NicknameNew'
import RoomNew from './pages/RoomNew'
import RoomJoin from './pages/RoomJoin'
import PostNew from './pages/PostNew'
import PostList from './pages/PostList'

// アプリのルートコンポーネント（SPA）
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Top />} />
                <Route path="/nickname" element={<NicknameNew />} />
                <Route path="/rooms/new" element={<RoomNew />} />
                <Route path="/rooms/join" element={<RoomJoin />} />
                <Route path="/rooms/:roomId/posts/new" element={<PostNew />} />
                <Route path="/rooms/:roomId/posts" element={<PostList />} />
            </Routes>
        </BrowserRouter>
    );
}