import { X, Plus, Trash2, Mic, MicOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { requestAPI as api } from '../services/parentRequest'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

export const FrequentModal = ({ onSel, onClose }: any) => {
    const [l, setL] = useState<any[]>([]), [n, setN] = useState('')
    const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition()
    
    const ld = () => api.getFreq().then(res => setL(res.data.data))
    useEffect(() => { ld() }, [])
    
    // 음성 인식 결과를 텍스트 입력에 반영
    useEffect(() => {
        if (transcript && !isListening) {
            setN(transcript)
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
    
    const add = async () => { if (!n) return; await api.addFreq(n); setN(''); ld() }
    const del = async (id: number) => { await api.delFreq(id); ld() }

    const handleClose = () => {
        if (isListening) stopListening()
        resetTranscript()
        onClose()
    }

    // 컴포넌트 언마운트 시 음성 인식 정리
    useEffect(() => {
        return () => {
            if (isListening) {
                stopListening()
            }
        }
    }, [isListening, stopListening])

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 bg-gradient-to-r from-purple-400 to-purple-500 flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">자주 사는 물건</span>
                    <button 
                        onClick={handleClose} 
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X size={28} className="text-white" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {/* 새 물건 추가 */}
                    <div className="space-y-3">
                        <div className="relative">
                            <input 
                                value={n} 
                                onChange={e => setN(e.target.value)} 
                                className="w-full border-2 border-gray-300 p-4 pr-16 rounded-xl outline-none text-lg focus:border-purple-400 transition-colors" 
                                placeholder="새 물건 이름을 입력하세요 (음성 가능)..." 
                                onKeyPress={e => e.key === 'Enter' && add()}
                            />
                            {isSupported && (
                                <button
                                    onClick={handleVoiceToggle}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-lg transition-colors ${
                                        isListening 
                                            ? 'bg-red-500 text-white animate-pulse' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    title={isListening ? '음성 인식 중지' : '음성으로 입력'}
                                >
                                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={add} 
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                        >
                            <Plus size={28} />
                            추가하기
                        </button>
                    </div>

                    {/* 목록 */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-700">목록</h3>
                        <div className="max-h-80 overflow-y-auto space-y-3">
                            {l.length === 0 ? (
                                <div className="text-center text-gray-400 py-8 text-lg">
                                    아직 추가된 물건이 없습니다
                                </div>
                            ) : (
                                l.map(i => (
                                    <div key={i.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                                        <span 
                                            onClick={() => onSel(i.name)} 
                                            className="flex-1 cursor-pointer hover:text-purple-600 font-medium text-lg"
                                        >
                                            {i.name}
                                        </span>
                                        <button 
                                            onClick={() => del(i.id)}
                                            className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
