import { X, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { requestAPI as api } from '../services/parentRequest'

export const FrequentModal = ({ onSel, onClose }: any) => {
    const [l, setL] = useState<any[]>([]), [n, setN] = useState('')
    const ld = () => api.getFreq().then(res => setL(res.data.data))
    useEffect(() => { ld() }, [])
    const add = async () => { if (!n) return; await api.addFreq(n); setN(''); ld() }
    const del = async (id: number) => { await api.delFreq(id); ld() }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 bg-yellow-400 flex justify-between items-center font-bold">
                    <span>자주 사는 물건</span>
                    <X onClick={onClose} className="cursor-pointer" />
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex gap-2">
                        <input value={n} onChange={e => setN(e.target.value)} className="flex-1 border-b-2 p-1 outline-none" placeholder="새 물건 추가..." />
                        <button onClick={add} className="p-2 bg-blue-500 text-white rounded-full"><Plus size={16} /></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {l.map(i => (
                            <div key={i.id} className="flex justify-between items-center p-2 bg-gray-50 rounded group">
                                <span onClick={() => onSel(i.name)} className="flex-1 cursor-pointer hover:text-blue-600 font-medium">{i.name}</span>
                                <Trash2 onClick={() => del(i.id)} size={16} className="text-gray-300 hover:text-red-500 cursor-pointer" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
