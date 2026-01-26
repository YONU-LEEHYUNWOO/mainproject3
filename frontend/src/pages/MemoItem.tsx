import { Trash2, Edit2 } from 'lucide-react'
export const Memo = ({ r, onE, onD }: any) => (
    <div className="p-3 border-b border-yellow-200 flex justify-between group bg-white/50">
        <span className={r.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}>{r.content}</span>
        <div className="flex gap-2">
            <button onClick={() => onE(r)} className="text-blue-500"><Edit2 size={16} /></button>
            <button onClick={() => onD(r.id)} className="text-red-500"><Trash2 size={16} /></button>
        </div>
    </div>
)
