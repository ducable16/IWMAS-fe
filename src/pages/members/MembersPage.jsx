import { UserPlus, Search, MoreHorizontal, Mail } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const MEMBERS = [
  { id: 1, name: 'Alex Johnson', email: 'alex@company.com', role: 'Project Manager', workloadScore: 45 },
  { id: 2, name: 'Marcus Rivera', email: 'marcus@company.com', role: 'Senior Engineer', workloadScore: 89 },
  { id: 3, name: 'Sarah Chen', email: 'sarah@company.com', role: 'Frontend Dev', workloadScore: 34 },
  { id: 4, name: 'Jamie Park', email: 'jamie@company.com', role: 'Backend Engineer', workloadScore: 41 },
  { id: 5, name: 'Priya Nair', email: 'priya@company.com', role: 'Senior Engineer', workloadScore: 38 },
  { id: 6, name: 'Tran Minh Duc', email: 'duc@company.com', role: 'Backend Engineer', workloadScore: 81 },
  { id: 7, name: 'Hana Lee', email: 'hana@company.com', role: 'QA Engineer', workloadScore: 47 },
  { id: 8, name: 'Alex Kim', email: 'kim@company.com', role: 'Infrastructure', workloadScore: 29 },
]

const scoreColor = (s) =>
  s >= 80 ? 'text-danger' : s >= 60 ? 'text-[#C0552F]' : s >= 40 ? 'text-warning' : 'text-success'
const scoreBg = (s) =>
  s >= 80 ? 'bg-danger' : s >= 60 ? 'bg-[#C0552F]' : s >= 40 ? 'bg-warning' : 'bg-success'

export default function MembersPage() {
  const [search, setSearch] = useState('')

  const filtered = MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
            Team members
          </h2>
          <p className="text-text-secondary text-[14px] mt-1">{MEMBERS.length} members in workspace</p>
        </div>
        <button className="btn-primary">
          <UserPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
          Invite member
        </button>
      </div>

      <div className="flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-1.5 max-w-[280px] focus-within:border-border-strong transition-colors">
        <Search className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members…"
          className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((member) => (
          <div key={member.id} className="card p-4 hover:border-border transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-bg-subtle border border-border-subtle flex items-center justify-center text-[13px] font-semibold text-text-primary">
                {member.name[0]}
              </div>
              <button className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 rounded">
                <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <h4 className="text-[14px] font-medium text-text-primary">{member.name}</h4>
            <p className="text-[12px] text-text-muted mt-0.5">{member.role}</p>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11.5px] text-text-muted">Workload</span>
                <span className={clsx('text-[12px] font-medium tabular-nums', scoreColor(member.workloadScore))}>
                  {member.workloadScore}/100
                </span>
              </div>
              <div className="h-1 bg-bg-subtle rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500', scoreBg(member.workloadScore))}
                  style={{ width: `${member.workloadScore}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle">
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-1.5 text-[11.5px] text-text-muted hover:text-accent transition-colors min-w-0"
              >
                <Mail className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{member.email}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
