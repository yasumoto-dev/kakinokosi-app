import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createPost } from '../../api/client'
import styles from './PostNew.module.css'

const COLOR_TAGS = {
    red:    ['うれしい', 'ドキドキ', 'ありがとう', '好き', '会いたい'],
    blue:   ['寂しい', '悲しい', '疲れた', '落ちつく'],
    yellow: ['楽しい', 'わくわく', 'びっくり', '笑った'],
    green:  ['ほっとした', '癒された', '懐かしい', '穏やか'],
}

const COLOR_HEX = {
    red: '#FF6B6B',
    blue: '#6B9FFF',
    yellow: '#FFD93D',
    green: '#6BCB77',
}

const TAG_STYLES = {
    red:    { color: '#c94040', borderColor: '#c94040', background: 'rgba(255,107,107,0.1)', selBg: '#FF6B6B', selColor: 'white' },
    blue:   { color: '#3a6fd8', borderColor: '#3a6fd8', background: 'rgba(107,159,255,0.1)', selBg: '#6B9FFF', selColor: 'white' },
    yellow: { color: '#a07800', borderColor: '#a07800', background: 'rgba(255,217,61,0.15)', selBg: '#FFD93D', selColor: '#a07800' },
    green:  { color: '#2a7a3a', borderColor: '#2a7a3a', background: 'rgba(107,203,119,0.1)', selBg: '#6BCB77', selColor: 'white' },
}

const TIMING_OPTIONS = [
    { value: 'immediate', label: '今すぐ届ける' },
    { value: 'today_22',  label: '今夜 22:00 に届ける' },
    { value: 'tomorrow_10', label: '明日 10:00 に届ける' },
]

export default function PostNew() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const [moodColor, setMoodColor] = useState('')
    const [emotionTag, setEmotionTag] = useState('')
    const [text, setText] = useState('')
    const [publishTiming, setPublishTiming] = useState('immediate')
    const [error, setError] = useState('')

    const userUuid = localStorage.getItem('userUuid')
    const nickname = localStorage.getItem('nickname')

    const handleColorSelect = (color) => {
        setMoodColor(color)
        setEmotionTag('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!userUuid || !nickname) {
            setError('ルームに参加してから投稿してください')
            return
        }
        if (!moodColor) {
            setError('気分カラーを選んでください')
            return
        }

        try {
            const normalizedText = text.replace(/\n{4,}/g, '\n\n\n')

            await createPost(roomId, {
                userUuid,
                nickname,
                moodColor,
                emotionTag,
                text: normalizedText,
                publishTiming 
            })
            navigate(`/rooms/${roomId}/posts`)
        } catch (err) {
            setError(err.response?.data?.detail || 'エラーが発生しました')
        }
    }

    const envelopeBg = moodColor ? COLOR_HEX[moodColor] : '#d0ccc4'
    const isYellow = moodColor === 'yellow'
    const senderColor = isYellow ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)'
    const hintColor = isYellow ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)'

    return (
        <div className={styles.page}>
            <button
                className={styles.backButton}
                onClick={() => navigate(`/rooms/${roomId}/posts`)}
            >
                ← 戻る
            </button>

            {error && <p className={styles.error}>{error}</p>}

            {/* 封筒部分 */}
            <div className={styles.envelope} style={{ backgroundColor: envelopeBg }}>
                <div className={styles.envelopeSender} style={{ color: senderColor }}>
                    {nickname} より
                </div>

                {/* 色選択 */}
                <div className={styles.colorList}>
                    {Object.entries(COLOR_HEX).map(([color, hex]) => (
                        <div
                            key={color}
                            className={`${styles.colorCircle} ${moodColor === color ? styles.colorCircleSelected : ''}`}
                            style={{ backgroundColor: hex }}
                            onClick={() => handleColorSelect(color)}
                        />
                    ))}
                </div>

                <div className={styles.envelopeHint} style={{ color: hintColor }}>
                    {moodColor ? '♡' : '気分カラーを選んでください'}
                </div>
            </div>

            {/* 手紙用紙部分 */}
            <div className={styles.paper}>
                <div className={styles.ruledLines} />

                {/* 感情タグ */}
                {moodColor && (
                    <div className={styles.tagList}>
                        {COLOR_TAGS[moodColor].map((tag) => {
                            const ts = TAG_STYLES[moodColor]
                            const isSelected = emotionTag === tag
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    className={styles.tagButton}
                                    style={{
                                        color: isSelected ? ts.selColor : ts.color,
                                        borderColor: ts.borderColor,
                                        backgroundColor: isSelected ? ts.selBg : ts.background,
                                    }}
                                    onClick={() => setEmotionTag(isSelected ? '' : tag)}
                                >
                                    {tag}
                                </button>
                            )
                        })}
                    </div>
                )}

                <textarea
                    className={styles.textarea}
                    rows={6}
                    placeholder="気持ちを書いてみよう..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={400}
                />
                <div className={styles.charCount}>{text.length} / 400</div>
            </div>

            {/* 公開タイミング */}
            <div className={styles.timing}>
                <div className={styles.timingLabel}>いつ届ける？</div>
                <div className={styles.timingOptions}>
                    {TIMING_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`${styles.timingButton} ${publishTiming === opt.value ? styles.timingButtonSelected : ''}`}
                            onClick={() => setPublishTiming(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <button className={styles.submitButton} onClick={handleSubmit}>
                手紙を送る
            </button>
        </div>
    )
}