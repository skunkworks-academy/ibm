import React from 'react';
import '../css/theory-visuals.css';

type TheoryKind = 'architecture' | 'recovery' | 'concurrency' | 'optimizer';

type ConceptItem = {
  label: string;
  value: string;
  note: string;
};

export function ConceptStrip({items}: {items: ConceptItem[]}) {
  return (
    <div className="concept-strip" aria-label="Key theory concepts">
      {items.map((item) => (
        <article className="concept-strip__item" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.note}</p>
        </article>
      ))}
    </div>
  );
}

function ArchitectureVisual() {
  return (
    <>
      <g className="theory-node theory-node--wide" transform="translate(250 36)">
        <rect width="460" height="54" rx="16" />
        <text x="230" y="33" textAnchor="middle">Operating system / host</text>
      </g>
      <g className="theory-node" transform="translate(310 112)">
        <rect width="340" height="54" rx="16" />
        <text x="170" y="33" textAnchor="middle">Db2 installation / code level</text>
      </g>
      <g className="theory-node theory-node--accent" transform="translate(350 188)">
        <rect width="260" height="54" rx="16" />
        <text x="130" y="33" textAnchor="middle">Db2 instance</text>
      </g>
      <g className="theory-node" transform="translate(390 264)">
        <rect width="180" height="54" rx="16" />
        <text x="90" y="33" textAnchor="middle">Database</text>
      </g>
      <g className="theory-node" transform="translate(410 340)">
        <rect width="140" height="54" rx="16" />
        <text x="70" y="24" textAnchor="middle">Schemas</text>
        <text x="70" y="41" textAnchor="middle">Objects</text>
      </g>
      <path className="theory-flow" d="M480 90V112M480 166V188M480 242V264M480 318V340" />
      <text className="theory-axis-label" x="70" y="80">Broader blast radius</text>
      <path className="theory-axis" d="M150 92V350" />
      <text className="theory-axis-label" x="70" y="372">Narrower scope</text>
      <text className="theory-side-note" x="720" y="120">Ask first:</text>
      <text className="theory-side-note theory-side-note--strong" x="720" y="148">Where does this state live?</text>
      <text className="theory-side-note" x="720" y="190">Then decide:</text>
      <text className="theory-side-note theory-side-note--strong" x="720" y="218">What can this change affect?</text>
    </>
  );
}

function RecoveryVisual() {
  return (
    <>
      <g className="theory-node theory-node--accent" transform="translate(54 86)">
        <rect width="164" height="62" rx="16" />
        <text x="82" y="27" textAnchor="middle">Running</text>
        <text x="82" y="47" textAnchor="middle">database</text>
      </g>
      <g className="theory-node" transform="translate(284 38)">
        <rect width="170" height="62" rx="16" />
        <text x="85" y="27" textAnchor="middle">Backup</text>
        <text x="85" y="47" textAnchor="middle">image</text>
      </g>
      <g className="theory-node" transform="translate(284 146)">
        <rect width="170" height="62" rx="16" />
        <text x="85" y="27" textAnchor="middle">Active +</text>
        <text x="85" y="47" textAnchor="middle">archive logs</text>
      </g>
      <g className="theory-node" transform="translate(520 86)">
        <rect width="160" height="62" rx="16" />
        <text x="80" y="27" textAnchor="middle">Restore</text>
        <text x="80" y="47" textAnchor="middle">base state</text>
      </g>
      <g className="theory-node theory-node--accent" transform="translate(746 86)">
        <rect width="164" height="62" rx="16" />
        <text x="82" y="27" textAnchor="middle">Rollforward</text>
        <text x="82" y="47" textAnchor="middle">to target</text>
      </g>
      <g className="theory-node theory-node--success" transform="translate(634 284)">
        <rect width="210" height="62" rx="16" />
        <text x="105" y="27" textAnchor="middle">Validated</text>
        <text x="105" y="47" textAnchor="middle">service recovery</text>
      </g>
      <path className="theory-flow" d="M218 117H520M454 69H520M454 177H600V148M680 117H746M828 148V284" />
      <g className="theory-bracket">
        <path d="M84 238H416" />
        <text x="250" y="264" textAnchor="middle">RPO limits acceptable data loss</text>
      </g>
      <g className="theory-bracket">
        <path d="M520 238H904" />
        <text x="712" y="264" textAnchor="middle">RTO limits restoration time</text>
      </g>
      <text className="theory-side-note theory-side-note--strong" x="65" y="332">Backup ≠ recovery</text>
      <text className="theory-side-note" x="65" y="358">Recovery is proven only when the service is restored, consistent and validated.</text>
    </>
  );
}

function ConcurrencyVisual() {
  return (
    <>
      <g className="theory-node" transform="translate(54 56)">
        <rect width="180" height="58" rx="16" />
        <text x="90" y="35" textAnchor="middle">Application A</text>
      </g>
      <g className="theory-node theory-node--warning" transform="translate(54 168)">
        <rect width="180" height="58" rx="16" />
        <text x="90" y="25" textAnchor="middle">Application B</text>
        <text x="90" y="44" textAnchor="middle">waiting</text>
      </g>
      <g className="theory-node" transform="translate(54 280)">
        <rect width="180" height="58" rx="16" />
        <text x="90" y="35" textAnchor="middle">Application C</text>
      </g>
      <g className="theory-node theory-node--accent" transform="translate(382 135)">
        <rect width="196" height="88" rx="20" />
        <text x="98" y="36" textAnchor="middle">Lock manager</text>
        <text x="98" y="60" textAnchor="middle">compatibility + wait graph</text>
      </g>
      <g className="theory-node theory-node--success" transform="translate(718 135)">
        <rect width="188" height="88" rx="20" />
        <text x="94" y="35" textAnchor="middle">Protected data</text>
        <text x="94" y="60" textAnchor="middle">rows / pages / tables</text>
      </g>
      <path className="theory-flow" d="M234 85H344Q382 85 382 135M234 197H382M234 309H344Q382 309 382 223M578 179H718" />
      <path className="theory-flow theory-flow--warning" d="M382 197H274" />
      <text className="theory-side-note theory-side-note--strong" x="286" y="250">Wait ≠ failure</text>
      <text className="theory-side-note" x="286" y="276">A wait is the visible consequence of a dependency between transactions.</text>
      <text className="theory-axis-label" x="628" y="88">Isolation decides what can be seen</text>
      <text className="theory-axis-label" x="628" y="111">and how long protection is retained.</text>
    </>
  );
}

function OptimizerVisual() {
  const stages = [
    ['SQL', 'statement'],
    ['Rewrite', '+ normalize'],
    ['Statistics', '+ cardinality'],
    ['Cost', 'model'],
    ['Access', 'plan'],
    ['Runtime', 'evidence'],
  ];
  return (
    <>
      {stages.map(([a, b], index) => {
        const x = 34 + index * 150;
        return (
          <g className={index === 5 ? 'theory-node theory-node--success' : index === 2 ? 'theory-node theory-node--accent' : 'theory-node'} transform={`translate(${x} 118)`} key={a}>
            <rect width="122" height="74" rx="16" />
            <text x="61" y="31" textAnchor="middle">{a}</text>
            <text x="61" y="52" textAnchor="middle">{b}</text>
          </g>
        );
      })}
      {stages.slice(0, -1).map((_, index) => {
        const start = 156 + index * 150;
        return <path className="theory-flow" d={`M${start} 155H${start + 28}`} key={start} />;
      })}
      <path className="theory-feedback" d="M846 224C846 332 180 332 180 224" />
      <text className="theory-axis-label" x="480" y="306" textAnchor="middle">Observed runtime feeds the next hypothesis: estimates → plan → actual outcome</text>
      <g className="theory-metric" transform="translate(275 30)">
        <text x="0" y="0">Selectivity</text>
        <text x="122" y="0">Distribution</text>
        <text x="254" y="0">I/O cost</text>
        <text x="350" y="0">CPU cost</text>
      </g>
      <text className="theory-side-note theory-side-note--strong" x="76" y="382">Tuning is a feedback loop, not a one-time configuration change.</text>
    </>
  );
}

export function TheoryVisual({kind, title, caption}: {kind: TheoryKind; title: string; caption: string}) {
  const titleId = `theory-${kind}-title`;
  const descriptionId = `theory-${kind}-description`;
  const arrowId = `theory-${kind}-arrow`;

  return (
    <figure className={`theory-visual theory-visual--${kind}`}>
      <div className="theory-visual__heading">
        <span className="eyebrow">Visual mental model</span>
        <h2>{title}</h2>
      </div>
      <svg viewBox="0 0 960 420" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
        <title id={titleId}>{title}</title>
        <desc id={descriptionId}>{caption}</desc>
        <defs>
          <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="theory-arrow-head" />
          </marker>
        </defs>
        <g style={{'--theory-arrow': `url(#${arrowId})`} as React.CSSProperties}>
          {kind === 'architecture' && <ArchitectureVisual />}
          {kind === 'recovery' && <RecoveryVisual />}
          {kind === 'concurrency' && <ConcurrencyVisual />}
          {kind === 'optimizer' && <OptimizerVisual />}
        </g>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
