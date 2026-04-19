import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function NicknameNew() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirect = searchParams.get('redirect')
    const [nickname, setNickname] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (!nickname.trim()) {
            setError('ニックネームを入力してください')
            return
        }

        const useUuid = localStorage.getItem('userUuid') || crypto.randomUUID()
        localStorage.setItem('userUuid', userUuid)
        localStorage.setItem('nickname', nickname)

        if (redirect === 'create') {
            navigate('/rooms/new')
        } else if (redirect === 'join') {
            navigate('/rooms/join')
        } else {
            navigate('/')
        }
    }

    return (
        <div>
            <h1>ニックネームを決めよう</h1>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ニックネーム</label>
                    <input value={nickname} onChange={(e) => setNickname(e.target,value)} required />

                </div>
                <button type="submit">決定する</button>
            </form>
        </div>
    );
}