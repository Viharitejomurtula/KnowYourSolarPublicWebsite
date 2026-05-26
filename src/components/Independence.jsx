import { useReveal } from '../hooks/useReveal.js'

export default function Independence() {
  const ref = useReveal()

  return (
    <div ref={ref} className="independence reveal">
      <div className="independence-mark">⊘</div>
      <h2>
        No installers. No referrals. <em>No agenda.</em>
      </h2>
      <p>
        KnowYourSolar earns revenue only from you. We have no installer
        partnerships and no affiliate commissions, which means we'll tell you
        when solar doesn't make sense — because our business depends on your
        trust, not someone else's close.
      </p>
    </div>
  )
}
