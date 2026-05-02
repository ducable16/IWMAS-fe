// Inline colour tokens — keep in sync with tailwind.config.js (Notion palette)
// Used where Tailwind classes can't reach (chart fills, inline svg, etc.)

export const workloadColor = (score) =>
  score >= 80 ? '#B43A18' :    // critical (deep orange-red)
  score >= 60 ? '#DD5B00' :    // high     (orange)
  score >= 40 ? '#DD5B00' :    // medium   (orange — same hue, lighter usage via subtle bg)
                '#1AAE39'      // low      (green)

export const priorityColor = (p) =>
  ({
    critical: '#B43A18',
    high:     '#DD5B00',
    medium:   '#DD5B00',
    low:      '#615D59',
  }[String(p ?? '').toLowerCase()] || '#615D59')

export const statusColor = (s) =>
  ({
    done:        '#1AAE39',
    in_progress: '#0075DE',
    review:      '#391C57',
    todo:        '#615D59',
  }[String(s ?? '').toLowerCase()] || '#615D59')
