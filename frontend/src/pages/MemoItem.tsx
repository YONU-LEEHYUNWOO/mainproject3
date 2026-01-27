import { Trash2, Edit2 } from 'lucide-react'
export const Memo = ({ r, onE, onD }: any) => (
    <div className="p-5 rounded-xl flex justify-between items-center group bg-white shadow-md hover:shadow-lg transition-shadow">
        <span className={`text-lg font-medium flex-1 ${r.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {r.content}
        </span>
        <div className="flex gap-3 ml-4">
            <button 
                onClick={() => onE(r)} 
                className="p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                title="수정"
            >
                <Edit2 size={24} />
            </button>
            <button 
                onClick={() => onD(r.id)} 
                className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="삭제"
            >
                <Trash2 size={24} />
            </button>
        </div>
    </div>
)
