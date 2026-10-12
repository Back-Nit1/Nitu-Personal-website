import type { ReactNode } from 'react'
import type { VisualId } from '../content/index.ts'

// Schematics drawn in code. They illustrate how a project works;
// none of them is a screenshot or a recorded run, and each is captioned as such.

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

function Nomos() {
  const cols = [40, 120, 200, 280]
  const rows = [30, 80, 130]
  const cars: [number, number, boolean][] = [
    [72, 30, true], [120, 56, false], [160, 80, true], [200, 104, false],
    [236, 80, true], [120, 110, false], [280, 54, false], [96, 130, true],
  ]
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="A street grid with small vehicles and dashed lines where they coordinate at intersections">
      <g className="v-line">
        {cols.map((x) => <path key={x} d={`M${x} 8V152`} />)}
        {rows.map((y) => <path key={y} d={`M12 ${y}H308`} />)}
      </g>
      <g className="v-link">
        <path d="M120 56Q146 58 160 80" />
        <path d="M160 80Q178 100 200 104" />
        <path d="M200 104Q226 100 236 80" />
        <path d="M72 30Q98 34 120 56" />
      </g>
      {cars.map(([x, y, across], i) => (
        <rect key={i} className="v-fill" x={x - (across ? 7 : 4)} y={y - (across ? 4 : 7)} width={across ? 14 : 8} height={across ? 8 : 14} rx="2.5" />
      ))}
      <circle className="v-ring" cx="160" cy="80" r="17" />
    </svg>
  )
}

function Naigos() {
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="A learned route curving between two radar coverage zones over terrain, beside a dashed direct route that crosses one of them">
      <path className="v-soft" d="M0 160V118L38 92 70 112 112 70 150 108 190 84 232 116 268 90 320 122V160Z" />
      <path className="v-line" d="M0 118L38 92 70 112 112 70 150 108 190 84 232 116 268 90 320 122" />
      <circle className="v-zone" cx="128" cy="62" r="38" />
      <circle className="v-zone" cx="226" cy="74" r="30" />
      <path className="v-line dashed" d="M24 52L296 44" />
      <path className="v-route" d="M24 52C60 110 150 128 182 104S258 18 296 44" />
      <circle className="v-fill" cx="24" cy="52" r="4" />
      <circle className="v-ring" cx="296" cy="44" r="6" />
      <circle className="v-fill" cx="296" cy="44" r="2.5" />
      <text className="v-text" x="128" y="38" textAnchor="middle">radar</text>
      <text className="v-text" x="262" y="34" textAnchor="middle">objective</text>
    </svg>
  )
}

function Palura() {
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="A small platform game scene: a character says the word leap and jumps a gap toward a gem">
      <g className="v-soft">
        <rect x="0" y="118" width="120" height="42" rx="4" />
        <rect x="170" y="96" width="92" height="64" rx="4" />
        <rect x="282" y="68" width="38" height="92" rx="4" />
      </g>
      <g className="v-line">
        <path d="M0 118H120M170 96H262M282 68H320" />
      </g>
      <path className="v-link" d="M88 100Q138 26 196 80" />
      <rect className="v-fill" x="76" y="96" width="18" height="22" rx="6" />
      <circle className="v-fill" cx="85" cy="88" r="7" />
      <path className="v-bubble" d="M30 30h62a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H78l-6 10-2-10H30a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8Z" />
      <text className="v-word" x="61" y="52" textAnchor="middle">“leap”</text>
      <path className="v-ring" d="M301 40l9 10-9 12-9-12Z" />
      {range(3).map((i) => <circle key={i} className="v-fill" cx={206 + i * 18} cy="86" r="2.5" />)}
    </svg>
  )
}

function Seqra() {
  const residues = 'KWLRIVKR'.split('')
  const bars = [46, 38, 31, 22, 14]
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="Three stages: a generated peptide chain, candidates ranked as bars, and a predicted helix structure">
      <g className="v-line">
        <path d={`M18 62${residues.map((_, i) => `L${18 + i * 12} ${i % 2 ? 78 : 62}`).join('')}`} />
        <path d="M112 70h18M214 70h18" />
        <path d="M126 66l5 4-5 4M228 66l5 4-5 4" />
      </g>
      {residues.map((r, i) => (
        <g key={i}>
          <circle className={i === 2 || i === 5 ? 'v-fill' : 'v-node'} cx={18 + i * 12} cy={i % 2 ? 78 : 62} r="5.5" />
          <text className="v-tiny" x={18 + i * 12} y={(i % 2 ? 78 : 62) + 2.6} textAnchor="middle">{r}</text>
        </g>
      ))}
      {bars.map((b, i) => (
        <rect key={i} className={i === 0 ? 'v-fill' : 'v-soft'} x="146" y={44 + i * 11} width={b} height="7" rx="2" />
      ))}
      <path className="v-route" d="M246 96c10-22 20-22 30 0s20 22 30 0M246 66c10-22 20-22 30 0s20 22 30 0" />
      <path className="v-line" d="M251 85v-30M261 80v-30M271 88v-30M281 100v-30M291 92v-30M301 82v-30" opacity=".5" />
      <g className="v-text">
        <text x="60" y="124" textAnchor="middle">generate</text>
        <text x="170" y="124" textAnchor="middle">rank</text>
        <text x="276" y="124" textAnchor="middle">structure</text>
      </g>
    </svg>
  )
}

function Kairos() {
  const stages: [number, number, number, string][] = [
    [20, 92, 12, 'scan'],
    [126, 60, 6, 'filter'],
    [220, 28, 3, 'surface'],
  ]
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="A funnel in three stages: many opportunities scanned, fewer pass rule based filters, a handful surfaced to the founder">
      <path className="v-link" d="M96 80H126M186 80H220" />
      {stages.map(([x, h, n, label], s) => (
        <g key={label}>
          <rect className="v-soft" x={x} y={80 - h / 2} width={s === 0 ? 76 : s === 1 ? 60 : 56} height={h} rx="5" />
          {range(n).map((i) => (
            <circle
              key={i}
              className={s === 2 ? 'v-fill' : 'v-node'}
              cx={x + 12 + (i % 4) * 14}
              cy={80 - h / 2 + 12 + Math.floor(i / 4) * 14}
              r="3.2"
            />
          ))}
          <text className="v-text" x={x + (s === 0 ? 38 : s === 1 ? 30 : 28)} y="140" textAnchor="middle">{label}</text>
        </g>
      ))}
    </svg>
  )
}

function Gate() {
  const outs: [number, string, boolean][] = [[45, 'allow', true], [80, 'deny', false], [115, 'review', false]]
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="A model proposes an action, a deterministic policy gate decides, and the result is allow, deny, or human review">
      <circle className="v-ring" cx="52" cy="80" r="18" />
      <text className="v-text" x="52" y="118" textAnchor="middle">model</text>
      <path className="v-link" d="M70 80H146" />
      <rect className="v-fill" x="146" y="26" width="10" height="108" rx="3" />
      <text className="v-text" x="151" y="150" textAnchor="middle">policy</text>
      {outs.map(([y, label, solid]) => (
        <g key={label}>
          <path className="v-line" d={`M156 80C190 80 196 ${y} 230 ${y}`} />
          <circle className={solid ? 'v-fill' : 'v-node'} cx="236" cy={y} r="6" />
          <text className="v-text" x="252" y={y + 3}>{label}</text>
        </g>
      ))}
    </svg>
  )
}

function Covenant() {
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="An escrow vault holding funds in layers, with each layer released to the creator once its milestone evidence is posted">
      <rect className="v-node" x="20" y="24" width="64" height="104" rx="6" />
      {range(4).map((i) => (
        <rect key={i} className={i === 3 ? 'v-soft' : 'v-fill'} x="28" y={32 + i * 23} width="48" height="17" rx="3" opacity={i === 3 ? 1 : 0.35 + i * 0.2} />
      ))}
      <text className="v-text" x="52" y="148" textAnchor="middle">escrow</text>
      {range(3).map((i) => {
        const y = 40.5 + i * 23
        return (
          <g key={i}>
            <path className="v-link" d={`M84 ${y}H${150 + i * 40}`} />
            <rect className="v-node" x={150 + i * 40} y={y - 9} width="52" height="18" rx="9" />
            <text className="v-tiny" x={176 + i * 40} y={y + 2.6} textAnchor="middle">{`milestone ${i + 1}`}</text>
          </g>
        )
      })}
      <path className="v-ring" d="M258 106l8 9 14-18" />
      <text className="v-text" x="250" y="148" textAnchor="middle">evidence posted</text>
    </svg>
  )
}

function Meridian() {
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="A voice referral passes through a stack of rules that sets urgency, then a nurse signs off before an appointment is booked">
      <path className="v-bubble" d="M14 54h54a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H48l-8 10-2-10H14a8 8 0 0 1-8-8V62a8 8 0 0 1 8-8Z" />
      {[0, 1, 2].map((i) => <rect key={i} className="v-soft" x={24 + i * 12} y={79 - [6, 12, 8][i]} width="6" height={[12, 24, 16][i]} rx="3" />)}
      <path className="v-link" d="M76 75H104" />
      {range(4).map((i) => (
        <rect key={i} className={i === 1 ? 'v-fill' : 'v-node'} x="104" y={38 + i * 20} width="60" height="14" rx="4" />
      ))}
      <path className="v-link" d="M164 75H196" />
      <circle className="v-ring" cx="214" cy="75" r="16" />
      <path className="v-route" d="M207 75l5 6 9-11" />
      <path className="v-link" d="M230 75H252" />
      <rect className="v-node" x="252" y="61" width="54" height="28" rx="7" />
      <g className="v-text">
        <text x="42" y="128" textAnchor="middle">voice</text>
        <text x="134" y="128" textAnchor="middle">rules</text>
        <text x="214" y="128" textAnchor="middle">nurse</text>
        <text x="279" y="79" textAnchor="middle">booked</text>
      </g>
    </svg>
  )
}

function Praedos() {
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="A verified profile fills three form fields it is sure about and leaves the fourth blank">
      <rect className="v-node" x="14" y="26" width="70" height="92" rx="7" />
      {range(3).map((i) => <rect key={i} className="v-soft" x="24" y={42 + i * 20} width="50" height="8" rx="3" />)}
      {range(4).map((i) => (
        <g key={i}>
          <rect className={i === 3 ? 'v-line dashed' : 'v-node'} x="150" y={26 + i * 30} width="156" height="20" rx="5" />
          {i < 3 && <circle className="v-fill" cx="162" cy={36 + i * 30} r="3.5" />}
          {i < 3 && <path className="v-link" d={`M84 ${46 + i * 20}C118 ${46 + i * 20} 118 ${36 + i * 30} 150 ${36 + i * 30}`} />}
        </g>
      ))}
      <text className="v-text" x="228" y="130" textAnchor="middle">not sure: left blank</text>
      <text className="v-text" x="49" y="140" textAnchor="middle">profile</text>
    </svg>
  )
}

function Cerno() {
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="Intent, then the changes in a diff, then evidence from tests; a model's opinion above is crossed out because it is not proof">
      <rect className="v-node" x="14" y="44" width="72" height="68" rx="6" />
      {range(3).map((i) => <rect key={i} className="v-soft" x="24" y={56 + i * 16} width={i === 1 ? 36 : 52} height="7" rx="3" />)}
      <rect className="v-node" x="124" y="44" width="72" height="68" rx="6" />
      {range(4).map((i) => <rect key={i} className={i === 1 || i === 2 ? 'v-fill' : 'v-soft'} x="134" y={54 + i * 13} width={[48, 36, 44, 30][i]} height="6" rx="3" />)}
      <rect className="v-node" x="234" y="44" width="72" height="68" rx="6" />
      <path className="v-route" d="M256 80l9 10 17-22" />
      <path className="v-link" d="M86 78H124M196 78H234" />
      <rect className="v-line dashed" x="234" y="6" width="72" height="22" rx="9" />
      <text className="v-tiny" x="270" y="20" textAnchor="middle">model says ok</text>
      <path className="v-line" d="M238 17H302" />
      <g className="v-text">
        <text x="50" y="136" textAnchor="middle">intent</text>
        <text x="160" y="136" textAnchor="middle">changes</text>
        <text x="270" y="136" textAnchor="middle">evidence</text>
      </g>
    </svg>
  )
}

function Sentinel() {
  const rows = ['stripe', 'salesforce', 'slack']
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="An agent writes to three systems and reads each one back; one write that did not land is retried before the case counts as resolved">
      <circle className="v-ring" cx="40" cy="80" r="18" />
      <text className="v-text" x="40" y="118" textAnchor="middle">agent</text>
      {rows.map((r, i) => {
        const y = 36 + i * 44
        return (
          <g key={r}>
            <path className="v-link" d={`M58 80C110 80 130 ${y - 5} 190 ${y - 5}`} />
            <rect className="v-node" x="190" y={y - 14} width="84" height="28" rx="6" />
            <text className="v-tiny" x="232" y={y + 2.6} textAnchor="middle">{r}</text>
            {i === 1 ? <circle className="v-ring" cx="296" cy={y} r="8" /> : <path className="v-route" d={`M288 ${y}l5 6 10-12`} />}
            <path className="v-line dashed" d={`M274 ${y + 5}H${i === 1 ? 288 : 284}`} />
          </g>
        )
      })}
      <text className="v-text" x="232" y="150" textAnchor="middle">read back, retry if missing</text>
    </svg>
  )
}

function MacroLeague() {
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="A phone logs meals to a database that computes points and feeds a leaderboard; a direct write from the phone to the leaderboard is blocked">
      <rect className="v-node" x="14" y="44" width="44" height="82" rx="9" />
      {range(3).map((i) => <circle key={i} className="v-fill" cx="36" cy={64 + i * 20} r="4" />)}
      <path className="v-link" d="M58 85H122" />
      <rect className="v-node" x="122" y="55" width="76" height="60" rx="8" />
      <text className="v-tiny" x="160" y="82" textAnchor="middle">points</text>
      <text className="v-tiny" x="160" y="96" textAnchor="middle">streaks</text>
      <path className="v-link" d="M198 85H236" />
      {[52, 40, 26].map((w, i) => <rect key={i} className={i === 0 ? 'v-fill' : 'v-soft'} x="236" y={56 + i * 20} width={w} height="12" rx="3" />)}
      <path className="v-line dashed" d="M36 44C70 4 200 4 262 40" />
      <path className="v-route" d="M144 8l16 16M160 8l-16 16" />
      <g className="v-text">
        <text x="36" y="146" textAnchor="middle">log meals</text>
        <text x="160" y="146" textAnchor="middle">server computes</text>
        <text x="262" y="146" textAnchor="middle">leaderboard</text>
      </g>
    </svg>
  )
}

const scenes: Record<VisualId, () => ReactNode> = {
  nomos: Nomos,
  naigos: Naigos,
  palura: Palura,
  seqra: Seqra,
  kairos: Kairos,
  gate: Gate,
  covenant: Covenant,
  meridian: Meridian,
  praedos: Praedos,
  cerno: Cerno,
  sentinel: Sentinel,
  macroleague: MacroLeague,
}

export function Scene({ id }: { id: VisualId }) {
  const Draw = scenes[id]
  return (
    <figure className="figure">
      <div className="scene"><Draw /></div>
      <figcaption>Conceptual sketch</figcaption>
    </figure>
  )
}

/** The stages of a real pipeline, in order. */
export function Flow({ steps }: { steps: string[] }) {
  return (
    <figure className="figure">
      <ol className="flow">
        {steps.map((s) => <li key={s}>{s}</li>)}
      </ol>
      <figcaption>Workflow</figcaption>
    </figure>
  )
}
