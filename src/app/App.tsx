import { createBrowserRouter, RouterProvider } from 'react-router';
import { RootLayout } from './components/RootLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ProtectedDashboard from './components/ProtectedDashboard';
import Overview from './pages/Overview';
import BatchDetail from './pages/BatchDetail';
import History from './pages/History';
import CameraMonitoring from './pages/CameraMonitoring';
import Weather from './pages/Weather';
import VoiceAlerts from './pages/VoiceAlerts';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import FarmManagement from './pages/admin/FarmManagement';
import BatchManagement from './pages/admin/BatchManagement';
import AdminCameraMonitoring from './pages/admin/CameraMonitoring';
import RiskManagement from './pages/admin/RiskManagement';
import Revenue from './pages/admin/Revenue';
import Analytics from './pages/admin/Analytics';
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/admin/Settings';


const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/dashboard',
        element: <ProtectedDashboard />,
        children: [
          {
            index: true,
            element: <CameraMonitoring />,
          },
          {
            path: 'batch/:id',
            element: <BatchDetail />,
          },
          {
            path: 'camera',
            element: <CameraMonitoring />,
          },
          {
            path: 'weather',
            element: <Weather />,
          },
          {
            path: 'voice',
            element: <VoiceAlerts />,
          },
          {
            path: 'history',
            element: <History />,
          },
        ],
      },
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminOverview />,
          },
          {
 path: 'farms',
            element: <FarmManagement />,
          },
          {
            path: 'batches',
            element: <BatchManagement />,
          },
          {
            path: 'cameras',
            element: <AdminCameraMonitoring />,
          },
          {
            path: 'risks',
            element: <RiskManagement />,
          },
          {
            path: 'revenue',
            element: <Revenue />,
          },
          {
            path: 'analytics',
            element: <Analytics />,
          },
          {
            path: 'users',
            element: <UserManagement />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}