import React from 'react';
import Link from '@docusaurus/Link';
import {objectiveCount, officialParts, partById} from '../data/objectives';

export function PartObjectiveOverview({partId}: {partId: string}) {
  const part = partById(partId);
  if (!part) return null;

  return (
    <section className="objective-overview" aria-label={`${part.title} objectives`}>
      <div className="objective-overview__header">
        <div>
          <span className="eyebrow">IBM-aligned objective map</span>
          <h2>{part.units.length} official units · {part.units.reduce((sum, unit) => sum + unit.objectives.length, 0)} objectives</h2>
        </div>
        <Link className="button button--secondary" to="/course/objective-crosswalk">Open full crosswalk</Link>
      </div>
      <div className="objective-unit-grid">
        {part.units.map((unit, index) => (
          <article className="objective-unit-card" key={unit.id}>
            <span>Unit {index + 1}</span>
            <strong>{unit.title}</strong>
            <p>{unit.objectives.length} source-aligned objectives</p>
            <a href={`#${unit.anchor}`}>Jump to unit ↓</a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ObjectiveCrosswalk() {
  return (
    <section className="objective-crosswalk" aria-label="CLA96G objective coverage crosswalk">
      <div className="objective-crosswalk__summary">
        <div><span className="eyebrow">Coverage baseline</span><strong>{objectiveCount}</strong><p>IBM unit objectives represented in the course model.</p></div>
        <div><span className="eyebrow">Official structure</span><strong>4 parts · 16 units</strong><p>Skunkworks enrichment is nested beneath the source structure rather than replacing it.</p></div>
        <div><span className="eyebrow">Evidence model</span><strong>Learn → practise → assess</strong><p>Every unit feeds knowledge checks, practical evidence, assessment sampling or incident practice.</p></div>
      </div>

      {officialParts.map((part) => (
        <section className="crosswalk-part" key={part.id}>
          <div className="crosswalk-part__heading">
            <div><span className="eyebrow">Part {part.number}</span><h2>{part.title}</h2></div>
            <Link to={part.href}>Open Part {part.number} →</Link>
          </div>
          <div className="crosswalk-units">
            {part.units.map((unit, unitIndex) => (
              <article className="crosswalk-unit" key={unit.id}>
                <header>
                  <div><span>Unit {unitIndex + 1} · {unit.id.toUpperCase()}</span><h3>{unit.title}</h3></div>
                  <Link to={`${part.href}#${unit.anchor}`}>Learning content →</Link>
                </header>
                <ol>
                  {unit.objectives.map((objective) => (
                    <li key={objective.id}>
                      <code>{objective.id}</code>
                      <span>{objective.text}</span>
                    </li>
                  ))}
                </ol>
                <div className="crosswalk-evidence">
                  <span><strong>Practice:</strong> stateful simulator / practical evidence checklist</span>
                  <span><strong>Assessment:</strong> randomized question bank mapped to {unit.id.toUpperCase()}</span>
                  <span><strong>Incidents:</strong> scenario coverage where the objective is operationally diagnosable</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
