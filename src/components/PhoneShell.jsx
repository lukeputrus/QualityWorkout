import BottomNav from './BottomNav.jsx'

export default function PhoneShell({ children, nav = false }) {
  return (
    <div className="min-h-screen w-full bg-ink-950 flex items-center justify-center py-6 px-3 sm:px-4">
      <div className="relative w-full max-w-[430px] h-[880px] max-h-[94vh] bg-ink-900 rounded-[2.5rem] shadow-phone overflow-hidden flex flex-col ring-1 ring-white/5">
        <div className="absolute top-0 inset-x-0 h-10 flex items-center justify-between px-7 text-[13px] font-semibold text-ink-200 z-20 pointer-events-none">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-2.5 rounded-sm border border-ink-200/70" />
          </span>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar pt-10">{children}</div>
        {nav && <BottomNav />}
      </div>
    </div>
  )
}
