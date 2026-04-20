import { useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'

const DEMO_INSIGHTS = `## Workforce Analysis — Sprint 15

**Overall Assessment:** Your team's workload distribution is **imbalanced** with a Gini coefficient of **0.38**, indicating moderate inequality. Two members are approaching burnout thresholds.

### Critical Observations

1. **Marcus Rivera** (score: 89/100) — Carrying 14 active tasks across 3 parallel workstreams. Recommend redistributing TASK-203 and TASK-207 immediately. His estimated capacity utilization is at **142%**.

2. **Team Velocity Risk** — At current pace, Sprint 15 will complete **71%** of committed tasks. The 3 externally-blocked tasks represent a cascade risk if not resolved by Day 7.

### Recommendations

- **Immediate:** Move 2-3 tasks from Marcus to Sarah Chen or Alex Kim who both have capacity
- **Short-term:** Establish a task ceiling of 8 active items per developer during this sprint
- **Process:** The Gini coefficient has risen from 0.22 (Sprint 13) to 0.38 — consider reviewing your backlog refinement process

### Predicted Outcome
With the above changes applied, estimated Sprint 15 completion improves to **91%** and burnout risk reduces from HIGH to LOW for affected team members.`

export default function LLMExplainer() {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(null)
  const [expanded, setExpanded] = useState(true)

  const runAnalysis = async () => {
    setLoading(true)
    setContent(null)
    await new Promise((r) => setTimeout(r, 1500))
    setContent(DEMO_INSIGHTS)
    setLoading(false)
    setExpanded(true)
  }

  return (
    <div className="card p-5 bg-bg-subtle">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />
        <h3 className="section-title text-[13px]">AI analysis</h3>
        <span className="badge-outline">Claude Opus 4.7</span>
        {content && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto text-text-muted hover:text-text-primary transition-colors p-1 -m-1 rounded"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" strokeWidth={1.75} /> : <ChevronDown className="w-4 h-4" strokeWidth={1.75} />}
          </button>
        )}
      </div>

      {!content && !loading && (
        <div className="text-center py-3">
          <p className="text-text-secondary text-[13px] mb-3 leading-relaxed">
            Get a detailed analysis of your team's workload, risks, and actionable recommendations.
          </p>
          <button onClick={runAnalysis} className="btn-primary text-[13px]">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
            Run analysis
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-3">
          <Loader2 className="w-4 h-4 text-accent animate-spin" strokeWidth={1.75} />
          <div>
            <p className="text-[13px] text-text-primary">Analyzing workload patterns…</p>
            <p className="text-[11.5px] text-text-muted mt-0.5">
              Calculating Gini coefficient, burnout risk, sprint forecast
            </p>
          </div>
        </div>
      )}

      {content && expanded && (
        <div className="space-y-3 animate-fade-in">
          {content.split('\n\n').map((block, i) => {
            if (block.startsWith('## ')) {
              return (
                <h4 key={i} className="font-serif font-medium text-text-primary text-[15px]">
                  {block.replace('## ', '')}
                </h4>
              )
            }
            if (block.startsWith('### ')) {
              return (
                <h5 key={i} className="font-semibold text-text-primary text-[12px] uppercase tracking-wide mt-3">
                  {block.replace('### ', '')}
                </h5>
              )
            }
            const rendered = block.replace(
              /\*\*(.+?)\*\*/g,
              '<strong class="text-text-primary font-semibold">$1</strong>',
            )
            return (
              <p
                key={i}
                className="text-[12.5px] text-text-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: rendered }}
              />
            )
          })}
          <button
            onClick={runAnalysis}
            className="btn-ghost text-[12px] mt-2 -ml-3"
          >
            <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
            Refresh analysis
          </button>
        </div>
      )}
    </div>
  )
}
