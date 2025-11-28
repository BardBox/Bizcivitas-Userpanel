'use client'

import { useState } from 'react'
import DashboardCard from '@/components/Dashboard/DashboardCard'
import BizConnectChart from '@/components/Dashboard/charts/BizConnectChart'
import BizWinChart from '@/components/Dashboard/charts/BizWinChart'
import MeetupsChart from '@/components/Dashboard/charts/MeetupsChart'
import VisitorInvitationChart from '@/components/Dashboard/charts/VisitorInvitationChart'
import { useSidebar } from '@/contexts/SidebarContext'

type DateRange = '15days' | '3months' | '6months' | 'tilldate' | 'custom'

interface DashboardClientProps {
  initialData: {
    bizConnectCount: number
    bizWinCount: string
    meetupsCount: number
    visitorCount: number
    canSeeVisitorInvitation: boolean
  }
}

// Helper function to get period label based on date range
const getPeriodLabel = (range: DateRange): string => {
  switch (range) {
    case '15days':
      return 'Fortnight Overview'
    case '3months':
      return 'Quarterly Overview'
    case '6months':
      return 'Half-Yearly Overview'
    case 'tilldate':
      return 'All Time Overview'
    case 'custom':
      return 'Custom Range Overview'
    default:
      return 'Fortnight Overview'
  }
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [activeChartIndex, setActiveChartIndex] = useState(0)
  const [selectedRange, setSelectedRange] = useState<DateRange>('15days')
  const { isCollapsed } = useSidebar()

  const { bizConnectCount, bizWinCount, meetupsCount, visitorCount, canSeeVisitorInvitation } = initialData

  // Get period label for card titles
  const periodLabel = getPeriodLabel(selectedRange)

  // Dashboard cards configuration with initial data
  const baseDashboardCards = [
    {
      id: '1',
      title: `${periodLabel}: BizConnect`,
      value: String(bizConnectCount),
      icon: '/dashboard/dash/bizconnect.svg',
      bgColor: 'bg-white',
      iconColor: 'text-dashboard-gray',
    },
    {
      id: '2',
      title: `${periodLabel.replace('Overview', '')}: BizWin`,
      value: bizWinCount,
      icon: '/dashboard/dash/bizwin.svg',
      bgColor: 'bg-white',
      iconColor: 'text-dashboard-gray',
    },
    {
      id: '3',
      title: `${periodLabel.replace('Overview', '')}: Meet-ups`,
      value: String(meetupsCount),
      icon: '/dashboard/dash/meetup.svg',
      bgColor: 'bg-white',
      iconColor: 'text-dashboard-gray',
    },
  ]

  // Conditionally add Visitor Invitation card
  const dashboardCards = canSeeVisitorInvitation
    ? [
        ...baseDashboardCards,
        {
          id: '4',
          title: `Visitor Invitation`,
          value: String(visitorCount),
          icon: '/dashboard/dash/invite.svg',
          bgColor: 'bg-white',
          iconColor: 'text-dashboard-gray',
        },
      ]
    : baseDashboardCards

  // Conditionally add VisitorInvitationChart
  const chartComponents = canSeeVisitorInvitation
    ? [BizConnectChart, BizWinChart, MeetupsChart, VisitorInvitationChart]
    : [BizConnectChart, BizWinChart, MeetupsChart]

  const ActiveChart = chartComponents[activeChartIndex]

  return (
    <>
      {/* Dashboard Cards Grid - Clickable to switch charts */}
      <div
        className={`grid grid-cols-1 ${isCollapsed ? 'md:grid-cols-2' : ''} lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4`}
      >
        {dashboardCards.map((card, index) => (
          <div key={card.id} onClick={() => setActiveChartIndex(index)} className="cursor-pointer">
            <DashboardCard card={card} isActive={activeChartIndex === index} />
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="mt-3 md:mt-4">
        <ActiveChart selectedRange={selectedRange} onRangeChange={setSelectedRange} />
      </div>
    </>
  )
}