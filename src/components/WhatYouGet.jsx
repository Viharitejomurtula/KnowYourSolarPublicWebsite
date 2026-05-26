import { useReveal } from '../hooks/useReveal.js'

const ITEMS = [
  {
    num: '01',
    title: 'The Recommendation',
    body: 'A clear yes, no, or wait — with the reasoning laid out plainly, not buried in fine print.',
    delay: null,
  },
  {
    num: '02',
    title: 'The Numbers',
    body: 'Expected payback period, IRR, and lifetime savings — modeled from your actual utility data.',
    delay: '0.1s',
  },
  {
    num: '03',
    title: 'The Caveats',
    body: 'What could change the math: roof condition, tax position, rate schedules, and risk factors.',
    delay: '0.2s',
  },
]

function ReportItem({ num, title, body, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="report-item reveal" style={delay ? { transitionDelay: delay } : undefined}>
      <div className="report-item-num">{num}</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  )
}

export default function WhatYouGet() {
  const headerRef = useReveal()

  return (
    <section className="what" id="what">
      <div ref={headerRef} className="reveal">
        <div className="section-tag">The Report</div>
        <h2 className="section-title">
          One document. A <em>clear</em> decision.
        </h2>
        <p className="section-body">
          We produce a single deliverable: a feasibility report that tells you
          whether solar makes financial sense for your property — and why.
        </p>
      </div>

      <div className="report-preview">
        {ITEMS.map((item) => (
          <ReportItem key={item.num} {...item} />
        ))}
      </div>
    </section>
  )
}
