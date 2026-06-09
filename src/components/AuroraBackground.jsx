/* Aurora + Grain background — pure CSS, GPU-only, no JS */
export default function AuroraBackground() {
  return (
    <>
      {/* Aurora orbs */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>

      {/* Grid overlay */}
      <div className="grid-bg" aria-hidden="true" />

      {/* Grain noise */}
      <div className="grain" aria-hidden="true" />
    </>
  )
}
