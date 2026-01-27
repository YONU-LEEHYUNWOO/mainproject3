import { useState, useEffect } from 'react'
import { requestAPI as api } from '../services/parentRequest'
import { favoritesAPI as fv } from '../services/api'
import { ShoppingBag, Send, MapPin, List, Mic, MicOff } from 'lucide-react'
import { Memo } from './MemoItem'
import { FrequentModal as Modal } from './FrequentModal'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

const ParentRequest = () => {
    const [t, setT] = useState(''), [l, setL] = useState<any[]>([]), [e, setE] = useState<any>(null), [m, setM] = useState(false)
    const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition()
    // 완료되지 않은 항목만 필터링하여 표시
    const ld = () => api.getList().then(res => {
        const items = res.data.data || []
        // 부모모드에서는 완료된 항목 제외
        const activeItems = items.filter((item: any) => !item.is_completed)
        setL(activeItems)
    })
    useEffect(() => { ld() }, [])
    
    // 음성 인식 결과를 텍스트 입력에 반영
    useEffect(() => {
        if (transcript && !isListening) {
            setT(transcript)
            resetTranscript()
        }
    }, [transcript, isListening, resetTranscript])
    
    const handleVoiceToggle = () => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }
    
    // 컴포넌트 언마운트 시 음성 인식 정리
    useEffect(() => {
        return () => {
            if (isListening) {
                stopListening()
            }
        }
    }, [isListening, stopListening])
    
    const sv = async (v?: string) => { const txt = v || t; if (!txt) return; e ? await api.upd(e.id, txt) : await api.create(txt); setT(''); setE(null); ld() }
    const fm = async () => {
        const res = await fv.getFavorites()
        const mk = (res.data.data || []).find((f: any) => f.category == 'mart')
        if (mk) window.open(`https://map.kakao.com/link/to/${mk.name},${mk.latitude},${mk.longitude}`, '_blank')
        else window.location.href = '/parent/location?search=마트'
    }
    return (
        <div className="p-4 space-y-6 bg-yellow-50 min-h-[80vh] rounded-xl border-l-4 border-yellow-200 shadow-inner">
            <h1 className="text-2xl font-bold flex gap-3 border-b-2 border-yellow-200 pb-3 items-center">
                <ShoppingBag size={32} /> 이거부탁해!
            </h1>
            
            {/* 입력 영역 */}
            <div className="bg-white/80 p-4 rounded-xl shadow-md space-y-3">
                <input 
                    value={t} 
                    onChange={x => setT(x.target.value)} 
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-lg outline-none focus:border-blue-400 transition-colors" 
                    placeholder="메모할 내용을 적어주세요 (음성으로도 가능)" 
                />
                
                {/* 버튼 영역 */}
                <div className="flex gap-3">
                    {isSupported && (
                        <button 
                            onClick={handleVoiceToggle} 
                            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                                isListening 
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse scale-105' 
                                    : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-red-400 hover:to-red-500 hover:text-white'
                            }`}
                            title={isListening ? '음성 인식 중지' : '음성으로 입력'}
                        >
                            {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                            {isListening ? '중지' : '음성입력'}
                        </button>
                    )}
                    <button 
                        onClick={() => setM(true)} 
                        className="flex-1 py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-purple-400 to-purple-500 text-white hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg"
                    >
                        <List size={28} />
                        자주 사는 것
                    </button>
                    <button 
                        onClick={() => sv()} 
                        className="flex-1 py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                    >
                        <Send size={28} />
                        전송
                    </button>
                </div>
            </div>

            {/* 마트찾기 버튼 */}
            <button 
                onClick={fm} 
                className="w-full py-5 px-6 rounded-xl font-bold text-xl flex items-center justify-center gap-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg"
            >
                <MapPin size={32} />
                마트 찾기
            </button>

            {/* 목록 */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-700">요청 목록</h2>
                {l.length === 0 ? (
                    <div className="bg-white/60 p-6 rounded-xl text-center text-gray-500 text-lg">
                        아직 요청이 없습니다
                    </div>
                ) : (
                    <div className="space-y-2">
                        {l.map(r => <Memo key={r.id} r={r} onE={(x: any) => { setE(x); setT(x.content) }} onD={async (id: any) => { await api.del(id); ld() }} />)}
                    </div>
                )}
            </div>
            
            {m && <Modal onClose={() => setM(false)} onSel={(n: string) => { sv(n); setM(false) }} />}
        </div>
    )
}
export default ParentRequest
