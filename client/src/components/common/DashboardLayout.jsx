// src/components/common/DashboardLayout.jsx
import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-surface bg-gradient-mesh">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                         onClick={() => setSidebarOpen(false)} />
                    <div className="relative z-10">
                        <Sidebar mobile onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 page-enter custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
