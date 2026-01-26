import { useState, useEffect } from 'react'
import { requestAPI as api } from '../services/parentRequest'
import { ShoppingBag, Circle } from 'lucide-react'
import { notificationLogsAPI } from '../services/api'

const ChildRequestList = () => {
    const [l, setL] = useState<any[]>([])
    const ld = () => api.getList().then(res => setL(res.data.data))
    useEffect(() => { ld() }, [])
    const tg = async (id: number) => { await api.toggle(id); ld() }
    const fl = l.filter(r => !r.is_completed)
    return (
        <div className="p-4 space-y-4 bg-yellow-50 min-h-[80vh] rounded-xl border-l-4 border-yellow-200">
            <h1 className="text-xl font-bold flex gap-2 border-b border-yellow-200 pb-2"><ShoppingBag /> 부모님 요청</h1>
            <div className="space-y-2">
                {fl.map(r => (
                    <div key={r.id} onClick={() => tg(r.id)} className="p-3 border-b border-yellow-100 flex justify-between cursor-pointer group">
                        <span className="text-lg text-gray-700">{r.content}</span>
                        <Circle className="text-gray-300 group-hover:text-yellow-400" size={20} />
                    </div>
                ))}
                {fl.length === 0 && l.length > 0 && <p className="text-center text-gray-400 p-8 italic">모든 물건을 확인했습니다! 🎉</p>}
            </div>
        </div>
    )
}
export default ChildRequestList
