import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './NicknameNew.module.css'

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

        const userUuid = localStorage.getItem('userUuid') || crypto.randomUUID()
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
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(`/`)}>
                ← 戻る
            </button>
            <h1 className={styles.title}>ニックネームを決めよう</h1>
            {error && <p style={{color: 'red'}}>{error}</p>}

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>ニックネーム</label>
                    <input 
                        className={styles.input}
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)} 
                        required />
                </div>
                <button className={styles.submitButton} type="submit">
                    決定する
                </button>
            </form>
        </div>
    );
}