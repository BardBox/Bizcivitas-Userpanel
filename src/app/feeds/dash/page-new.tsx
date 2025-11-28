import { getAuthToken } from '@/lib/serverAuth'
import DashboardClient from './DashboardClient'

// Server-side data fetching function
async function getDashboardData() {
  const token = await getAuthToken()

  if (!token) {
    return {
      bizConnectCount: 0,
      bizWinCount: '₹0',
      meetupsCount: 0,
      visitorCount: 0,
      canSeeVisitorInvitation: false,
      membershipType: '',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  try {
    // Fetch all dashboard data in parallel on the server
    const [userRes, bizConnectRes, bizWinRes, meetupsRes, visitorRes] = await Promise.allSettled([
      // Fetch user profile to get membership type
      fetch(`${baseUrl}/auth/me`, {
        headers,
        cache: 'no-store',
        next: { revalidate: 0 }
      }),

      fetch(`${baseUrl}/referrals/monthly-count`, {
        headers,
        cache: 'no-store', // Always fetch fresh data
        next: { revalidate: 0 }
      }),

      fetch(`${baseUrl}/record/last-15days-counts`, {
        headers,
        cache: 'no-store',
        next: { revalidate: 0 }
      }),

      fetch(`${baseUrl}/meetups/meeting-count`, {
        headers,
        cache: 'no-store',
        next: { revalidate: 0 }
      }),

      fetch(`${baseUrl}/meetings/last-15-days-invited-count`, {
        headers,
        cache: 'no-store',
        next: { revalidate: 0 }
      }),
    ])

    // Parse successful responses
    const userData = userRes.status === 'fulfilled' && userRes.value.ok
      ? await userRes.value.json()
      : null

    const bizConnectData = bizConnectRes.status === 'fulfilled' && bizConnectRes.value.ok
      ? await bizConnectRes.value.json()
      : null

    const bizWinData = bizWinRes.status === 'fulfilled' && bizWinRes.value.ok
      ? await bizWinRes.value.json()
      : null

    const meetupsData = meetupsRes.status === 'fulfilled' && meetupsRes.value.ok
      ? await meetupsRes.value.json()
      : null

    const visitorData = visitorRes.status === 'fulfilled' && visitorRes.value.ok
      ? await visitorRes.value.json()
      : null

    // Calculate values for dashboard cards
    const bizConnectCount = bizConnectData?.totalReferralsCount || 0
    const bizWinCount = bizWinData?.overallReceived
      ? `₹${(bizWinData.overallReceived / 100000).toFixed(1)}L`
      : '₹0'
    const meetupsCount = meetupsData?.last15DaysMeetupCount || 0
    const visitorCount = visitorData?.last15DaysCount || 0

    // Get user membership type from user profile
    const membershipType = userData?.data?.membershipType || userData?.membershipType || ''

    const canSeeVisitorInvitation =
      membershipType.toLowerCase().includes('core') ||
      membershipType.toLowerCase().includes('flagship') ||
      membershipType.toLowerCase().includes('industria')

    return {
      bizConnectCount,
      bizWinCount,
      meetupsCount,
      visitorCount,
      canSeeVisitorInvitation,
      membershipType,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      bizConnectCount: 0,
      bizWinCount: '₹0',
      meetupsCount: 0,
      visitorCount: 0,
      canSeeVisitorInvitation: false,
      membershipType: '',
    }
  }
}

export default async function DashboardPage() {
  // Fetch data on the server - NO CLIENT-SIDE FLICKER
  const initialData = await getDashboardData()

  return (
    <div className="min-h-screen bg-gray-50 md:rounded-3xl">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-3 md:space-y-4 md:mt-8 lg:mt-12">
        {/* Header - Server Rendered */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>

        {/* Client Interactive Components */}
        <DashboardClient initialData={initialData} />
      </div>
    </div>
  )
}