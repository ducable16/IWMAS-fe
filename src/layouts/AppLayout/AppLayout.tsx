import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
