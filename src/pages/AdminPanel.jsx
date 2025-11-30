
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminOrdersManagement from '../components/admin/AdminOrdersManagement'
import AdminProducersManagement from '../components/admin/AdminProducersManagement'
import AdminProductsManagement from '../components/admin/AdminProductsManagement'
import AdminCategoriesManagement from '../components/admin/AdminCategoriesManagement'
import PointsAdminTable from '../components/points/PointsAdminTable'
import PointModal from '../components/points/PointModal'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isPointModalOpen, setIsPointModalOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState(null)
  const [pointsRefreshKey, setPointsRefreshKey] = useState(0)

  // Points handlers
  const handleAddPoint = () => {
    setEditingPoint(null)
    setIsPointModalOpen(true)
  }

  const handleEditPoint = (point) => {
    setEditingPoint(point)
    setIsPointModalOpen(true)
  }

  const handlePointModalSuccess = () => {
    setPointsRefreshKey(prev => prev + 1)
  }

  const handlePointModalClose = () => {
    setIsPointModalOpen(false)
    setEditingPoint(null)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />
      case 'orders':
        return <AdminOrdersManagement />
      case 'points':
        return (
          <PointsAdminTable
            key={pointsRefreshKey}
            onAddPoint={handleAddPoint}
            onEditPoint={handleEditPoint}
          />
        )
      case 'producers':
        return <AdminProducersManagement />
      case 'products':
        return <AdminProductsManagement />
      case 'categories':
        return <AdminCategoriesManagement />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <header className="fixed top-0 left-0 right-0 h-12 flex items-center border-b bg-background z-50">
          <SidebarTrigger className="ml-2" />
          <h1 className="ml-4 text-lg font-semibold">Админ-панель</h1>
        </header>

        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-6 mt-12">
          {renderContent()}
        </main>

        <PointModal
          isOpen={isPointModalOpen}
          onClose={handlePointModalClose}
          onSuccess={handlePointModalSuccess}
          point={editingPoint}
          producerId=""
        />
      </div>
    </SidebarProvider>
  )
}

export default AdminPanel
