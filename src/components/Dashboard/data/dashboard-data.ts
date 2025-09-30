export interface DashboardCard {
  id: string;
  title: string;
  value: string;
  icon: string;
  bgColor: string;
  iconColor: string;
}

export interface ChartData {
  date: string;
  given: number;
  received: number;
}

export const dashboardCards: DashboardCard[] = [
  {
    id: "1",
    title: "Fortnight Overview: BizConnect",
    value: "05",
    icon: "/dashboard/dash/bizconnect.svg",
    bgColor: "bg-white",
    iconColor: "text-dashboard-gray",
  },
  {
    id: "2",
    title: "Last Fortnight's BizWin",
    value: "🏆",
    icon: "/dashboard/dash/bizwin.svg",
    bgColor: "bg-white",
    iconColor: "text-dashboard-gray",
  },
  {
    id: "3",
    title: "Last Fortnight's Meet-ups",
    value: "📋",
    icon: "/dashboard/dash/meetup.svg",
    bgColor: "bg-white",
    iconColor: "text-dashboard-gray",
  },
  {
    id: "4",
    title: "Visitor Invitation",
    value: "👥",
    icon: "/dashboard/dash/invite.svg",
    bgColor: "bg-white",
    iconColor: "text-dashboard-gray",
  },
];

export const timeFilters = [
  { id: "14days", label: "14 Days", active: true },
  { id: "6months", label: "6 Months", active: false },
  { id: "1year", label: "1 Year", active: false },
  { id: "tilldate", label: "Till date", active: false },
];

export const chartData: ChartData[] = [
  { date: "01", given: 23, received: 22 },
  { date: "02", given: 25, received: 24 },
  { date: "03", given: 28, received: 26 },
  { date: "04", given: 32, received: 30 },
  { date: "05", given: 35, received: 33 },
  { date: "06", given: 38, received: 36 },
  { date: "07", given: 42, received: 40 },
  { date: "08", given: 45, received: 43 },
  { date: "09", given: 48, received: 46 },
  { date: "10", given: 52, received: 50 },
  { date: "11", given: 55, received: 53 },
  { date: "12", given: 58, received: 56 },
  { date: "13", given: 62, received: 60 },
  { date: "14", given: 65, received: 63 },
];

export const userProfile = {
  name: "Hello Yash Jani!",
  avatar: "YJ",
  level: "Marketing Head",
};
