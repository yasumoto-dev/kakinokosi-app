import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Top from './pages/Top/Top'
import NicknameNew from './pages/NicknameNew/NicknameNew'
import RoomNew from './pages/RoomNew/RoomNew'
import RoomJoin from './pages/RoomJoin/RoomJoin'
import PostNew from './pages/PostNew/PostNew'
import PostList from './pages/PostList/PostList'
import PostDetail from './pages/PostDetail/PostDetail'

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
                <Route path="/rooms/:roomId/posts/:postId" element={<PostDetail />} />
            </Routes>
        </BrowserRouter>
    );
}