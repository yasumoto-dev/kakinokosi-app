import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PostList from './PostList'
import { getPosts } from '../../api/client'

// API 通信はモックに差し替える（実際のサーバーには繋がない）
vi.mock('../../api/client', () => ({
    getPosts: vi.fn(),
    deletePost: vi.fn(),
}))

const ME = 'me-uuid'
const PARTNER = 'partner-uuid'

const post = (overrides) => ({
    postId: '1',
    nickname: 'partner',
    moodColor: 'blue',
    emotionTag: null,
    text: '本文',
    publishedAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
    isPublished: true,
    isRead: false,
    userUuid: PARTNER,
    ...overrides,
})

const renderPage = () => render(
    <MemoryRouter initialEntries={['/rooms/room-1/posts']}>
        <Routes>
            <Route path="/rooms/:roomId/posts" element={<PostList />} />
        </Routes>
    </MemoryRouter>
)

describe('PostList のタブ振り分け', () => {
    beforeEach(() => {
        localStorage.setItem('userUuid', ME)
        getPosts.mockResolvedValue({
            data: {
                roomId: 'room-1',
                roomName: 'テストルーム',
                publishedPosts: [
                    post({ postId: '1', text: '相手の未読', isRead: false }),
                    post({ postId: '2', text: '相手の既読', isRead: true }),
                    post({ postId: '3', text: '自分の公開済み', userUuid: ME, isRead: true }),
                    post({ postId: '4', text: '自分の予約', userUuid: ME, isPublished: false, isRead: true }),
                ],
            },
        })
    })

    afterEach(() => {
        cleanup()
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('ユーザーの uuid を付けて一覧を取得する', async () => {
        renderPage()
        await screen.findByText('テストルーム')
        expect(getPosts).toHaveBeenCalledWith('room-1', ME)
    })

    it('各タブの件数が正しい', async () => {
        renderPage()
        expect(await screen.findByRole('button', { name: '未読 1' })).toBeTruthy()
        expect(screen.getByRole('button', { name: '既読 2' })).toBeTruthy()
        expect(screen.getByRole('button', { name: '時間指定 1' })).toBeTruthy()
    })

    it('既読タブ（初期表示）には相手の既読と自分の公開済みが出る', async () => {
        renderPage()
        expect(await screen.findByText('相手の既読')).toBeTruthy()
        expect(screen.getByText('自分の公開済み')).toBeTruthy()
        expect(screen.queryByText('自分の予約')).toBeNull()
    })

    it('未読タブには相手の未読が封筒で出る（本文は見えない・削除ボタンなし）', async () => {
        renderPage()
        fireEvent.click(await screen.findByRole('button', { name: '未読 1' }))
        expect(screen.getAllByText('開封して読む')).toHaveLength(1)
        expect(screen.queryByText('相手の未読')).toBeNull()
        expect(screen.queryByRole('button', { name: '削除' })).toBeNull()
    })

    it('時間指定タブには自分の未公開投稿が封筒で出る（削除ボタンあり）', async () => {
        renderPage()
        fireEvent.click(await screen.findByRole('button', { name: '時間指定 1' }))
        expect(screen.getAllByText('開封して読む')).toHaveLength(1)
        expect(screen.queryByText('自分の予約')).toBeNull()
        expect(screen.getByRole('button', { name: '削除' })).toBeTruthy()
    })
})
