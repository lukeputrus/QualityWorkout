import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function TopBar({ title, back = false, right = null }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between px-5 pt-2 pb-3 sticky top-0 bg-cream-50/80 backdrop-blur z-10">
      <div className="w-9">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-cream-200 text-ink-800"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
      <h1 className="text-[15px] font-semibold text-ink-800 truncate">{title}</h1>
      <div className="w-9 flex justify-end">{right}</div>
    </div>
  )
}
