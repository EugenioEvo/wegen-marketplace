export default function CompareBar({ count, goComparar }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-brand-900 shadow-bar">
      <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-4 px-6 py-[14px]">
        <span className="text-[14.5px] font-semibold text-white">
          <span className="mr-2 rounded-full bg-green-500 px-[9px] py-[2px]">{count}</span>
          oferta(s) selecionada(s) para comparar
        </span>
        <button
          onClick={goComparar}
          className="cursor-pointer rounded-xl border-none bg-green-500 px-[22px] py-[11px] text-[15px] font-semibold text-white hover:bg-green-600"
        >
          Comparar agora →
        </button>
      </div>
    </div>
  )
}
