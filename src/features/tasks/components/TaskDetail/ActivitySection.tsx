import { MessageSquare, History, Timer } from 'lucide-react'
import clsx from 'clsx'
import { CommentsTab } from './CommentsTab'
import { HistoryTab } from './HistoryTab'
import { WorkLogTab } from './WorkLogTab'
import type { Id, TaskComment } from '@/types'

const ACTIVITY_TABS = [
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'history',  label: 'History',  icon: History       },
  { id: 'worklog',  label: 'Work log', icon: Timer         },
]

interface ActivitySectionProps {
  activeTab: string
  onTabChange: (tab: string) => void
  taskId: Id
  comments?: TaskComment[] | undefined
  projectId?: Id | null | undefined
}

export function ActivitySection({ activeTab, onTabChange, taskId, comments, projectId }: ActivitySectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-semibold text-text-primary">Activity</h3>
      <div className="flex items-center gap-0.5 border-b border-border-subtle">
        {ACTIVITY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 pb-2 text-[12.5px] font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            <tab.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-[80px]">
        {activeTab === 'comments' && <CommentsTab taskId={taskId} comments={comments} projectId={projectId} />}
        {activeTab === 'history'  && <HistoryTab taskId={taskId} />}
        {activeTab === 'worklog'  && <WorkLogTab taskId={taskId} />}
      </div>
    </div>
  )
}
