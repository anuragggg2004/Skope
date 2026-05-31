export default function CollegeRow({ college }) {
  return (
    <div className="glass-card rounded-[14px] p-[18px_20px] sm:p-[20px_24px] hover:-translate-y-1 transition-all duration-300">
      {/* Top Row — Name + Badge + Fee */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h4 className="font-sora text-[14px] font-semibold text-white">{college.name}</h4>
          {college.is_hidden_gem && (
            <span className="font-dm text-[10px] font-medium bg-[rgba(251,191,36,0.15)] text-[#ffd93d] px-2 py-0.5 rounded border border-[rgba(251,191,36,0.3)] whitespace-nowrap">
              💎 Hidden Gem
            </span>
          )}
        </div>
        {(college.annual_fee || college.approx_annual_fee) && (
          <span className="font-dm text-[12px] text-[rgba(107,203,119,0.8)] font-medium shrink-0 whitespace-nowrap">
            {college.annual_fee || college.approx_annual_fee}
          </span>
        )}
      </div>

      {/* Meta Row — Location + Type */}
      <p className="font-dm text-[12px] text-[rgba(240,242,255,0.45)] mb-2.5">
        {college.location || college.city} · {college.type}
        {college.course_to_target && ` · ${college.course_to_target}`}
      </p>

      {/* Why It Fits */}
      <p className="font-dm text-[13px] text-[rgba(240,242,255,0.55)] leading-relaxed mb-2">
        {college.why_fits || college.why_this_fits}
      </p>

      {/* Caution (new field) */}
      {college.caution && (
        <div className="bg-[rgba(255,217,61,0.06)] border border-[rgba(255,217,61,0.12)] rounded-lg px-3.5 py-2.5 mt-2">
          <span className="font-dm text-[12px] text-[#ffd93d] leading-relaxed">
            ⚠️ {college.caution}
          </span>
        </div>
      )}
    </div>
  )
}
