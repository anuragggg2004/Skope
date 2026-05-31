export default function CareerCard({ career }) {
  return (
    <div className="glass-card rounded-[14px] p-5 flex flex-col h-full group hover:-translate-y-1 transition-all duration-300">
      {/* Title */}
      <h3 className="font-sora text-[16px] font-semibold text-white">{career.title}</h3>

      {/* Why it fits */}
      <p className="font-dm text-[13px] text-[rgba(240,242,255,0.5)] leading-relaxed">{career.why_it_fits}</p>

      {/* Entrance Exams */}
      <div className="flex flex-wrap gap-1.5">
        {career.entrance_exams.map((exam, i) => (
          <span
            key={i}
            className="font-dm text-[11px] font-medium text-blue bg-[rgba(79,142,247,0.1)] px-2.5 py-1 rounded-full border border-[rgba(79,142,247,0.2)]"
          >
            {exam}
          </span>
        ))}
      </div>

      {/* Earning Range */}
      <div className="flex items-center gap-2 mt-1">
        <span className="font-dm text-[11px] text-[rgba(240,242,255,0.35)] uppercase tracking-[0.5px]">Earning Range</span>
        <span className="font-dm text-[13px] text-white font-medium">{career.earning_range}</span>
      </div>

      {/* Reality Check */}
      <div className="bg-[rgba(255,217,61,0.06)] border border-[rgba(255,217,61,0.15)] rounded-lg px-3.5 py-2.5 mt-1">
        <span className="font-dm text-[12px] text-[#ffd93d] leading-relaxed">
          ⚡ {career.reality_check}
        </span>
      </div>
    </div>
  )
}
