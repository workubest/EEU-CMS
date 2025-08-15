import { motion } from 'framer-motion';
import { useMobile } from '@/hooks/useMobile';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  BarChart3,
  Plus,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

export function ModernMobileDashboard() {
  const { isNative, vibrate, showToast } = useMobile();
  const navigate = useNavigate();

  const handleQuickAction = async (action: string, path: string) => {
    await vibrate();
    await showToast(`Opening ${action}...`);
    navigate(path);
  };

  const stats = [
    {
      title: 'Active Cases',
      value: '24',
      change: '+3',
      icon: Clock,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Resolved',
      value: '156',
      change: '+12',
      icon: CheckCircle2,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Priority',
      value: '8',
      change: '+2',
      icon: AlertTriangle,
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    {
      title: 'Total Users',
      value: '89',
      change: '+5',
      icon: Users,
      color: '#6366F1',
      bgColor: 'rgba(99, 102, 241, 0.1)'
    },
  ];

  const quickActions = [
    {
      title: 'New Complaint',
      subtitle: 'Submit a new issue',
      icon: Plus,
      color: '#10B981',
      path: '/dashboard/complaints/new'
    },
    {
      title: 'View Reports',
      subtitle: 'Analytics & insights',
      icon: BarChart3,
      color: '#6366F1',
      path: '/dashboard/reports'
    },
    {
      title: 'Customer Portal',
      subtitle: 'Public access',
      icon: Users,
      color: '#EC4899',
      path: '/customer-portal'
    },
    {
      title: 'Quick Report',
      subtitle: 'Fast submission',
      icon: Zap,
      color: '#F59E0B',
      path: '/quick-report'
    },
  ];

  const recentActivity = [
    {
      id: '001',
      title: 'Power Outage Report',
      location: 'Addis Ababa, Bole',
      time: '2 min ago',
      status: 'urgent',
      priority: 'high'
    },
    {
      id: '002',
      title: 'Billing Issue',
      location: 'Hawassa, Sidamo',
      time: '15 min ago',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '003',
      title: 'Meter Reading Problem',
      location: 'Bahir Dar, Amhara',
      time: '1 hour ago',
      status: 'in-progress',
      priority: 'low'
    },
  ];

  if (!isNative) {
    return null; // Return regular dashboard for web
  }

  return (
    <div className="modern-mobile-content">
      <div className="modern-content-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Good Morning! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your complaints today</p>
        </motion.div>
      </div>

      <div className="modern-content-body">
        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-2 gap-4 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              className="modern-card p-4"
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-gray-600"
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="modern-list-item h-auto p-4 w-full justify-start"
                  onClick={() => handleQuickAction(action.title, action.path)}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mr-3"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <action.icon className="w-6 h-6" style={{ color: action.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">{action.title}</div>
                    <div className="text-sm text-gray-600">{action.subtitle}</div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-gray-600"
              onClick={() => navigate('/dashboard/complaints')}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="modern-list-item cursor-pointer"
                onClick={() => navigate(`/dashboard/complaints/${activity.id}`)}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 mb-1">{activity.title}</div>
                  <div className="text-sm text-gray-600 mb-1">{activity.location}</div>
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${activity.status}`}>
                      {activity.status.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Chart Preview */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.2 }}
          className="modern-card mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/analytics')}
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Analytics Preview</p>
              <p className="text-xs text-gray-500">Tap to view details</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="modern-fab"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 1.5
        }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleQuickAction('New Complaint', '/dashboard/complaints/new')}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}