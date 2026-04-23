import axios from 'axios'

// Axiosインスタンスの作成
const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

// APIのエンドポイントの定義
export const createRoom = (data) => (
    client.post('/api/rooms', data)
);
export const joinRoom = (roomId, data) => (
    client.post(`/api/rooms/${roomId}/join`, data)
);
export const createPost = (roomId, data) => (
    client.post(`api/rooms/${roomId}/posts`, data)
);
export const getPosts = (roomId, userUuid) => (
    client.get(`/api/rooms/${roomId}/posts`, {params: { userUuid } })
);
