import Navbar from '@/components/navbar/Navbar';
import { ReactNode } from "react"
import { useAppStore } from '@/store/store';
import { Groups, Home, Work, Upload, SyncAlt, Preview, AttachMoney, Business, BarChart, Dashboard } from '@mui/icons-material';
import { useRouter } from "next/router";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, token, isAuthenticated } = useAppStore()
  const router = useRouter();

  const handleLogout = async () => {
    logout();
  }
  return (
    <>
      <Navbar
        user={{user: user, token: token, isAuthenticated: isAuthenticated}}
        drawerWidth={240}
        lists={lists}
        handleLogout={handleLogout}
      />
      <main>{children}</main>
    </>
  )
}

const lists = [
  {
    key: "Home",
    label: "Home",
    icon: <Home />,
    link: "/",
  },
  {
    key: "Dashboard",
    label: "Dashboard",
    icon: <Dashboard />,
    link: "/dashboard",
  },
  {
    key: "Upload",
    label: "Upload",
    icon: <Upload />,
    link: "/upload"
  },
  {
    key: "Swap",
    label: "Swap",
    icon: <SyncAlt />,
    link: "/swap"
  },
  {
    key: "Team",
    label: "Team",
    icon: <Groups />,
    link: "/team"
  },
  {
    key: "preview",
    label: "preview",
    icon: <Preview />,
    nested: true,
    items: [
      {
        key: "Pricing",
        label: "Pricing",
        icon: <AttachMoney />,
        link: "/pricing"
      },
      {
        key: "career",
        label: "career",
        icon: <Work />,
        link: "/career"
      },
      {
        key: "Business Plan (Restricted)",
        label: "Business Plan (Restricted)",
        icon: <Business />,
        link: ""
      },
      {
        key: "Survey",
        label: "Survey",
        icon: <BarChart />,
        link: ""
      }
    ]
  }
];