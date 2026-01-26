import { useState, useEffect } from 'react'
import { requestAPI as api } from '../services/parentRequest'
import { favoritesAPI as fv } from '../services/api'
import { ShoppingBag, Send, MapPin, List } from 'lucide-react'
import { Memo } from './MemoItem'
import { FrequentModal as Modal } from './FrequentModal'

const ParentRequest = () => {
    const [t, setT] = useState(''), [l, setL] = useState<any[]>([]), [e, setE] = useState<any>(null), [m, setM] = useState(false)
    const ld = () => api.getList().then(res => setL(res.data.data))
    useEffect(() => { ld() }, [])
    const sv = async (v?: string) => { const txt = v || t; if (!txt) return; e ? await api.upd(e.id, txt) : await api.create(txt); setT(''); setE(null); ld() }
    const fm = async () => {
        const res = await fv.getFavorites()
        const mk = (res.data.data || []).find((f: any) => f.category == 'mart')
        if (mk) window.open(`https://map.kakao.com/link/to/${mk.name},${mk.latitude},${mk.longitude}`, '_blank')
        else window.location.href = '/parent/location?search=마트'
    }
    return (
        <div className="p-4 space-y-4 bg-yellow-50 min-h-[80vh] rounded-xl border-l-4 border-yellow-200 shadow-inner">
            <h1 className="text-xl font-bold flex gap-2 border-b-2 border-yellow-200 pb-2"><ShoppingBag /> 이거부탁해!</h1>
            <div className="flex gap-2 bg-white/60 p-2 rounded-lg">
                <input value={t} onChange={x => setT(x.target.value)} className="flex-1 p-2 bg-transparent outline-none" placeholder="메모할 내용을 적어주세요" />
                <button onClick={() => setM(true)} className="p-2 text-gray-400 hover:text-blue-500"><List /></button>
                <button onClick={() => sv()} className="bg-blue-500 text-white p-2 rounded-full shadow"><Send size={18} /></button>
            </div>
            <div className="flex justify-between px-1"><h2 className="font-bold">목록</h2><button onClick={fm} className="bg-orange-400 text-white px-2 py-1 rounded text-xs flex items-center gap-1 shadow"><MapPin size={12} /> 마트찾기</button></div>
            <div className="space-y-1">{l.map(r => <Memo key={r.id} r={r} onE={(x: any) => { setE(x); setT(x.content) }} onD={async (id: any) => { await api.del(id); ld() }} />)}</div>
            {m && <Modal onClose={() => setM(false)} onSel={(n: string) => { sv(n); setM(false) }} />}
        </div>
    )
}
export default ParentRequest
