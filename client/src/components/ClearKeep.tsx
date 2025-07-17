import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, PieChart, Plus, Edit, Trash2, Download, ChevronLeft, ChevronRight, X, History, Wallet, ReceiptText, Search, Filter, SortAsc, SortDesc, Upload, RefreshCcw, Settings, TrendingUp, Activity, BarChart3, ShoppingBag, Wrench, Megaphone, MoreHorizontal, Banknote, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/use-pwa';

// Create a context for app data and functions
const AppContext = createContext();

// Utility function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Utility function to check if backup reminder is needed
const checkBackupReminder = () => {
  const lastBackup = localStorage.getItem('lastBackupReminder');
  const now = new Date().getTime();
  const twoWeeks = 14 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds
  
  return !lastBackup || (now - parseInt(lastBackup)) > twoWeeks;
};

// Quick date filter options
const DATE_FILTERS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' }
];

// Sample data for demo mode
const DEMO_DATA = {
  clients: [
    {
      id: 'demo-client-1',
      name: 'Sarah Johnson',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@email.com',
      lastVisitDate: '2024-12-15',
      serviceNotes: 'Regular haircuts and styling. Prefers natural products.',
      communicationLog: [
        { date: '2024-12-10', note: 'Confirmed appointment for Friday' },
        { date: '2024-12-01', note: 'Referred friend Emma Wilson' }
      ]
    },
    {
      id: 'demo-client-2',
      name: 'Mike Chen',
      phone: '+1 (555) 987-6543',
      email: 'mike.chen@email.com',
      lastVisitDate: '2024-12-20',
      serviceNotes: 'Beard trim specialist. Prefers short appointments.',
      communicationLog: [
        { date: '2024-12-19', note: 'Requested earlier appointment time' }
      ]
    },
    {
      id: 'demo-client-3',
      name: 'Emma Wilson',
      phone: '+1 (555) 456-7890',
      email: 'emma.wilson@email.com',
      lastVisitDate: '2024-12-18',
      serviceNotes: 'Color treatments and highlights. Sensitive scalp.',
      communicationLog: [
        { date: '2024-12-16', note: 'Loves the new color! Wants to book next appointment' }
      ]
    }
  ],
  appointments: [
    {
      id: 'demo-appt-1',
      clientId: 'demo-client-1',
      date: '2024-12-16',
      time: '14:00',
      service: 'Hair Cut & Style',
      status: 'Completed',
      duration: 60,
      recurring: 'Monthly'
    },
    {
      id: 'demo-appt-2',
      clientId: 'demo-client-2',
      date: '2024-12-16',
      time: '16:30',
      service: 'Beard Trim',
      status: 'Completed',
      duration: 30,
      recurring: 'Weekly'
    },
    {
      id: 'demo-appt-3',
      clientId: 'demo-client-3',
      date: '2024-12-17',
      time: '10:00',
      service: 'Color Treatment',
      status: 'Scheduled',
      duration: 120,
      recurring: 'None'
    }
  ],
  incomeEntries: [
    {
      id: 'demo-income-1',
      date: '2024-12-16',
      amount: 75,
      method: 'Credit Card',
      notes: 'Hair Cut & Style - Sarah Johnson',
      clientId: 'demo-client-1'
    },
    {
      id: 'demo-income-2',
      date: '2024-12-16',
      amount: 35,
      method: 'Cash',
      notes: 'Beard Trim - Mike Chen',
      clientId: 'demo-client-2'
    },
    {
      id: 'demo-income-3',
      date: '2024-12-18',
      amount: 120,
      method: 'Credit Card',
      notes: 'Color Treatment - Emma Wilson',
      clientId: 'demo-client-3'
    }
  ],
  expenseEntries: [
    {
      id: 'demo-expense-1',
      date: '2024-12-18',
      amount: 45.99,
      category: 'Supplies',
      description: 'Professional Hair Products',
      receiptUrl: ''
    },
    {
      id: 'demo-expense-2',
      date: '2024-12-15',
      amount: 25.00,
      category: 'Equipment',
      description: 'Hair Clipper Maintenance',
      receiptUrl: ''
    },
    {
      id: 'demo-expense-3',
      date: '2024-12-14',
      amount: 30.00,
      category: 'Marketing',
      description: 'Business Cards',
      receiptUrl: ''
    }
  ]
};

// Custom Alert Modal Component
const AlertModal = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      >
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full text-center border border-emerald-700">
          <p className="text-gray-100 text-lg mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Custom Confirm Modal Component
const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      >
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full text-center border border-emerald-700">
          <p className="text-gray-100 text-lg mb-6">{message}</p>
          <div className="flex justify-around space-x-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              No, wait!
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors duration-200"
            >
              Yes, I'm sure.
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Generic Edit/Add Modal Component
const EditModal = ({ isOpen, onClose, title, children, onSubmit, submitButtonText }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl max-w-md w-full border border-emerald-700 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition-colors duration-200 p-1 rounded-full bg-gray-700 hover:bg-gray-600"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-medium text-gray-100 mb-4 text-center">{title}</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              {children}
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-emerald-700 transition-colors duration-200 mt-4"
              >
                {submitButtonText}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Intro Modal Component
const IntroModal = ({ isOpen, onClose, onTryDemo, onStartFresh }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full text-center border border-emerald-700"
          >
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-3xl font-bold text-emerald-300 mb-4">Welcome to ClearKeep!</h2>
            <p className="text-gray-100 text-lg mb-6">
              Would you like to load sample data to explore how the app works?
            </p>
            <p className="text-gray-300 text-sm mb-8">
              You can view example clients, appointments, income, and expenses in action — and reset the app anytime.
            </p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={onTryDemo}
                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
              >
                ✅ Try Demo Data
              </button>
              <button
                onClick={onStartFresh}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                🚫 Start Fresh
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Backup Reminder Modal
const BackupReminderModal = ({ isOpen, onClose, onBackupNow }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl max-w-md w-full text-center border border-yellow-600"
          >
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">Backup Reminder</h3>
            <p className="text-gray-100 text-base mb-4">
              It's been a while since your last backup. Keep your business data safe!
            </p>
            <p className="text-gray-300 text-sm mb-6">
              Regular backups protect against data loss and help you maintain your business records.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={onBackupNow}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium"
              >
                Backup Now
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Remind Me Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Data Management Modal Component
const DataManagementModal = ({ isOpen, onClose, onExport, onImport, onReset, onClear }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl max-w-md w-full border border-emerald-700 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition-colors duration-200 p-1 rounded-full bg-gray-700 hover:bg-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold text-gray-100 mb-6 text-center">Data Management</h3>
            <div className="space-y-3">
              <button
                onClick={onExport}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Download size={16} />
                <span>Export Data</span>
              </button>
              <button
                onClick={onImport}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Upload size={16} />
                <span>Import Data</span>
              </button>
              <button
                onClick={onReset}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCcw size={16} />
                <span>Reset to Demo</span>
              </button>
              <button
                onClick={onClear}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Clear All Data</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// MainLayout Component
const MainLayout = ({ children, currentView, setCurrentView }) => {
  const { isInstallable, installApp } = usePWA();
  
  const navItems = [
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'income', label: 'Income', icon: DollarSign },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'summary', label: 'Summary', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans pb-20">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg p-4 border-b border-gray-700">
        <div className="text-center relative">
          <h1 className="text-3xl font-bold text-emerald-300">ClearKeep</h1>
          <p className="text-sm text-gray-400 mt-1">Track your hustle, find your peace.</p>
          
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={installApp}
              className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs flex items-center space-x-1 hover:bg-emerald-700 transition-colors duration-200"
            >
              <Smartphone size={14} />
              <span>Install App</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-gray-800 shadow-lg p-3 fixed bottom-0 left-0 right-0 z-40 border-t border-gray-700">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-lg text-xs font-medium transition-colors duration-200
                ${currentView === item.id
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700'
                }`}
            >
              <item.icon size={20} className="mb-1" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

// Summary View Component
const SummaryView = () => {
  const { clients, appointments, incomeEntries, expenseEntries } = useContext(AppContext);

  const monthlyIncome = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return incomeEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [incomeEntries]);

  const monthlyExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return expenseEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [expenseEntries]);

  const netProfit = monthlyIncome - monthlyExpenses;

  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Add recent appointments
    appointments
      .filter(apt => apt.status === 'Completed')
      .slice(-3)
      .forEach(apt => {
        const client = clients.find(c => c.id === apt.clientId);
        const income = incomeEntries.find(inc => inc.clientId === apt.clientId && inc.date === apt.date);
        activities.push({
          id: apt.id,
          type: 'appointment',
          description: `Appointment with ${client?.name || 'Unknown'}`,
          detail: `${apt.service} - ${apt.date} ${apt.time}`,
          amount: income?.amount || 0,
          date: apt.date
        });
      });

    // Add recent income
    incomeEntries
      .slice(-2)
      .forEach(income => {
        const client = clients.find(c => c.id === income.clientId);
        activities.push({
          id: income.id,
          type: 'income',
          description: 'Income recorded',
          detail: `${income.method} payment from ${client?.name || 'Unknown'}`,
          amount: income.amount,
          date: income.date
        });
      });

    // Add recent expenses
    expenseEntries
      .slice(-1)
      .forEach(expense => {
        activities.push({
          id: expense.id,
          type: 'expense',
          description: 'Expense logged',
          detail: expense.description,
          amount: -expense.amount,
          date: expense.date
        });
      });

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments, clients, incomeEntries, expenseEntries]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];

    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth - 5 + i + 12) % 12;
      const monthName = months[monthIndex];
      
      const monthIncome = incomeEntries
        .filter(entry => new Date(entry.date).getMonth() === monthIndex)
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const monthExpenses = expenseEntries
        .filter(entry => new Date(entry.date).getMonth() === monthIndex)
        .reduce((sum, entry) => sum + entry.amount, 0);

      data.push({
        month: monthName,
        income: monthIncome,
        expenses: monthExpenses
      });
    }

    return data;
  }, [incomeEntries, expenseEntries]);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-emerald-300">{clients.length}</p>
            </div>
            <Users className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-green-400">${monthlyIncome.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Expenses</p>
              <p className="text-2xl font-bold text-red-400">${monthlyExpenses.toFixed(2)}</p>
            </div>
            <Wallet className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Net Profit</p>
              <p className="text-2xl font-bold text-emerald-300">${netProfit.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-emerald-500" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No recent activity</p>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-emerald-500" />}
                  {activity.type === 'income' && <DollarSign className="w-4 h-4 text-green-500" />}
                  {activity.type === 'expense' && <ShoppingBag className="w-4 h-4 text-red-500" />}
                  <div>
                    <p className="text-sm font-medium text-gray-100">{activity.description}</p>
                    <p className="text-xs text-gray-400">{activity.detail}</p>
                  </div>
                </div>
                <span className={`font-medium text-sm ${activity.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {activity.amount >= 0 ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" />
          Monthly Overview
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Clients View Component
const ClientsView = () => {
  const { clients, addClient, updateClient, deleteClient, appointments, incomeEntries, setCurrentView } = useContext(AppContext);
  const [isAdding, setIsAdding] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [expandedClientId, setExpandedClientId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [lastVisitDate, setLastVisitDate] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [phone, setPhone] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('az');

  const [alertMessage, setAlertMessage] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name || '');
      setLastVisitDate(editingClient.lastVisitDate || '');
      setServiceNotes(editingClient.serviceNotes || '');
      setPhone(editingClient.phone || '');
    } else {
      setName('');
      setLastVisitDate('');
      setServiceNotes('');
      setPhone('');
    }
  }, [editingClient]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setAlertMessage('Client name is required.');
      return;
    }
    if (name.trim().length < 2) {
      setAlertMessage('Client name must be at least 2 characters long.');
      return;
    }

    const clientData = {
      name: name.trim(),
      lastVisitDate: lastVisitDate,
      serviceNotes: serviceNotes.trim(),
      phone: phone.trim(),
    };

    addClient({ id: generateId(), ...clientData });
    setAlertMessage(`${name.trim()} added successfully!`);
    setIsAdding(false);
    setName('');
    setLastVisitDate('');
    setServiceNotes('');
    setPhone('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setAlertMessage('Client name is required.');
      return;
    }
    if (name.trim().length < 2) {
      setAlertMessage('Client name must be at least 2 characters long.');
      return;
    }

    const clientData = {
      name: name.trim(),
      lastVisitDate: lastVisitDate,
      serviceNotes: serviceNotes.trim(),
      phone: phone.trim(),
    };

    updateClient({ ...editingClient, ...clientData });
    setAlertMessage(`${name.trim()} updated successfully!`);
    setEditingClient(null);
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setExpandedClientId(null);
  };

  const handleDeleteClick = (id) => {
    setConfirmMessage('Are you sure you want to delete this client? This will also remove associated appointments and income entries.');
    setConfirmAction(() => () => {
      deleteClient(id);
      setAlertMessage('Client deleted successfully.');
      setConfirmMessage('');
      setExpandedClientId(null);
    });
  };

  const sortedAndFilteredClients = useMemo(() => {
    let filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clientVisitCounts = appointments.reduce((acc, app) => {
      if (app.status === 'Completed') {
        acc[app.clientId] = (acc[app.clientId] || 0) + 1;
      }
      return acc;
    }, {});

    switch (sortOrder) {
      case 'az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'lastVisit':
        filtered.sort((a, b) => {
          const dateA = a.lastVisitDate ? new Date(a.lastVisitDate) : new Date(0);
          const dateB = b.lastVisitDate ? new Date(b.lastVisitDate) : new Date(0);
          return dateB - dateA;
        });
        break;
      case 'mostVisits':
        filtered.sort((a, b) => {
          const visitsA = clientVisitCounts[a.id] || 0;
          const visitsB = clientVisitCounts[b.id] || 0;
          return visitsB - visitsA;
        });
        break;
      default:
        break;
    }
    return filtered;
  }, [clients, searchTerm, sortOrder, appointments]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-100">Clients</h2>
        <button
          onClick={() => { setIsAdding(true); setEditingClient(null); setExpandedClientId(null); }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="az">Name (A-Z)</option>
            <option value="za">Name (Z-A)</option>
            <option value="lastVisit">Most Recent Visit</option>
            <option value="mostVisits">Most Frequent</option>
          </select>
        </div>
      </div>

      {/* Add Client Modal */}
      <EditModal
        isOpen={isAdding && !editingClient}
        onClose={() => setIsAdding(false)}
        title="Add New Client"
        onSubmit={handleAddSubmit}
        submitButtonText="Add Client"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Client Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter client name"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Last Visit Date</label>
          <input
            type="date"
            value={lastVisitDate}
            onChange={(e) => setLastVisitDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Service Notes</label>
          <textarea
            value={serviceNotes}
            onChange={(e) => setServiceNotes(e.target.value)}
            placeholder="Client preferences, notes, etc."
            rows="3"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>
      </EditModal>

      {/* Edit Client Modal */}
      <EditModal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        title="Edit Client"
        onSubmit={handleEditSubmit}
        submitButtonText="Update Client"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Client Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter client name"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Last Visit Date</label>
          <input
            type="date"
            value={lastVisitDate}
            onChange={(e) => setLastVisitDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Service Notes</label>
          <textarea
            value={serviceNotes}
            onChange={(e) => setServiceNotes(e.target.value)}
            placeholder="Client preferences, notes, etc."
            rows="3"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>
      </EditModal>

      {/* Clients List */}
      {sortedAndFilteredClients.length === 0 ? (
        <div className="text-center bg-gray-800 p-6 rounded-lg shadow-md">
          <p className="text-gray-400 text-lg mb-4">No clients found</p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
          >
            <Plus size={16} />
            <span>Add Your First Client</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {sortedAndFilteredClients.map((client) => {
              const visitCount = appointments.filter(app => app.clientId === client.id && app.status === 'Completed').length;
              const totalEarnings = incomeEntries.filter(inc => inc.clientId === client.id).reduce((sum, inc) => sum + inc.amount, 0);

              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 hover:scale-[1.02] transition-transform duration-200"
                >
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => setExpandedClientId(expandedClientId === client.id ? null : client.id)}
                  >
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-100 text-lg">{client.name}</h3>
                      {client.phone && (
                        <p className="text-gray-400 text-sm mt-1">
                          <a href={`tel:${client.phone}`} className="hover:text-emerald-400 transition-colors" onClick={(e) => e.stopPropagation()}>
                            {client.phone}
                          </a>
                        </p>
                      )}
                      {client.serviceNotes && (
                        <p className="text-gray-300 text-sm mt-2">{client.serviceNotes}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {client.lastVisitDate && (
                          <span className="bg-emerald-800 text-emerald-200 px-2 py-1 rounded-full text-xs">
                            Last visit: {new Date(client.lastVisitDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="bg-blue-800 text-blue-200 px-2 py-1 rounded-full text-xs">
                          {visitCount} appointments
                        </span>
                        <span className="bg-green-800 text-green-200 px-2 py-1 rounded-full text-xs">
                          ${totalEarnings.toFixed(2)} total
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(client); }}
                        className="text-emerald-400 hover:text-emerald-300 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(client.id); }}
                        className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {expandedClientId === client.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-700 space-y-3"
                    >
                      <h4 className="text-md font-medium text-gray-200">Appointment History:</h4>
                      {appointments.filter(app => app.clientId === client.id).length === 0 ? (
                        <p className="text-gray-400 text-sm">No appointments yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {appointments
                            .filter(app => app.clientId === client.id)
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map(app => {
                              const incomeForVisit = incomeEntries.find(
                                income => income.clientId === client.id && income.date === app.date
                              );
                              return (
                                <div key={app.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                  <div>
                                    <p className="text-sm text-gray-100 font-medium">{app.date} - {app.time}</p>
                                    <p className="text-sm text-gray-300">{app.service}</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1
                                      ${app.status === 'Scheduled' ? 'bg-emerald-800 text-emerald-100' :
                                        app.status === 'Completed' ? 'bg-green-700 text-green-100' :
                                        'bg-red-700 text-red-100'
                                      }`}
                                    >
                                      {app.status}
                                    </span>
                                  </div>
                                  {incomeForVisit && (
                                    <p className="text-md font-semibold text-emerald-300">${incomeForVisit.amount.toFixed(2)}</p>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                      <button
                        onClick={() => setCurrentView('appointments')}
                        className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-2 mt-4"
                      >
                        <Plus size={16} />
                        <span>Book New Appointment</span>
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />
      <ConfirmModal
        message={confirmMessage}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setConfirmMessage('');
          setConfirmAction(null);
        }}
        onCancel={() => {
          setConfirmMessage('');
          setConfirmAction(null);
        }}
      />
    </div>
  );
};

// Appointments View Component
const AppointmentsView = () => {
  const { clients, appointments, addAppointment, updateAppointment, deleteAppointment } = useContext(AppContext);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Form states
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [clientId, setClientId] = useState('');
  const [service, setService] = useState('');
  const [status, setStatus] = useState('Scheduled');

  const [alertMessage, setAlertMessage] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (editingAppointment) {
      setDate(editingAppointment.date || '');
      setTime(editingAppointment.time || '');
      setClientId(editingAppointment.clientId || '');
      setService(editingAppointment.service || '');
      setStatus(editingAppointment.status || 'Scheduled');
    } else {
      setDate('');
      setTime('');
      setClientId('');
      setService('');
      setStatus('Scheduled');
    }
  }, [editingAppointment]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!date || !time || !clientId || !service) {
      setAlertMessage('Please fill in all required fields.');
      return;
    }

    const appointmentData = {
      date,
      time,
      clientId,
      service: service.trim(),
      status,
    };

    addAppointment({ id: generateId(), ...appointmentData });
    setAlertMessage('Appointment booked successfully!');
    setIsAdding(false);
    setDate('');
    setTime('');
    setClientId('');
    setService('');
    setStatus('Scheduled');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!date || !time || !clientId || !service) {
      setAlertMessage('Please fill in all required fields.');
      return;
    }

    const appointmentData = {
      date,
      time,
      clientId,
      service: service.trim(),
      status,
    };

    updateAppointment({ ...editingAppointment, ...appointmentData });
    setAlertMessage('Appointment updated successfully!');
    setEditingAppointment(null);
  };

  const handleDeleteClick = (id) => {
    setConfirmMessage('Are you sure you want to delete this appointment?');
    setConfirmAction(() => () => {
      deleteAppointment(id);
      setAlertMessage('Appointment deleted successfully.');
      setConfirmMessage('');
    });
  };

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeek]);

  const weekAppointments = useMemo(() => {
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
    });
  }, [appointments, weekDays]);

  const getAppointmentsForDay = (day) => {
    const dayString = day.toISOString().split('T')[0];
    return weekAppointments.filter(appointment => appointment.date === dayString);
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-100">Appointments</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Week Navigator */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek(-1)}
            className="text-gray-400 hover:text-gray-100 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-semibold text-gray-100">{formatWeekRange()}</h3>
          <button
            onClick={() => navigateWeek(1)}
            className="text-gray-400 hover:text-gray-100 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <EditModal
        isOpen={isAdding && !editingAppointment}
        onClose={() => setIsAdding(false)}
        title="Book New Appointment"
        onSubmit={handleAddSubmit}
        submitButtonText="Book Appointment"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Time *</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Client *</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Service *</label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g., Hair Cut, Beard Trim, Color Treatment"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </EditModal>

      {/* Edit Appointment Modal */}
      <EditModal
        isOpen={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
        title="Edit Appointment"
        onSubmit={handleEditSubmit}
        submitButtonText="Update Appointment"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Time *</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Client *</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Service *</label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g., Hair Cut, Beard Trim, Color Treatment"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </EditModal>

      {/* Week Calendar */}
      <div className="space-y-4">
        {weekDays.map(day => {
          const dayAppointments = getAppointmentsForDay(day);
          const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
          const dayDate = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          return (
            <div key={day.toISOString()} className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-100">{dayName}, {dayDate}</h4>
                <span className="text-emerald-400 text-sm font-medium">
                  {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {dayAppointments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No appointments scheduled</p>
              ) : (
                <div className="space-y-2">
                  {dayAppointments.map(appointment => {
                    const client = clients.find(c => c.id === appointment.clientId);
                    const borderColor = appointment.status === 'Completed' ? 'border-green-500' : 
                                       appointment.status === 'Cancelled' ? 'border-red-500' : 
                                       'border-emerald-500';
                    
                    return (
                      <div key={appointment.id} className={`bg-gray-700 p-3 rounded-lg border-l-4 ${borderColor}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <p className="font-medium text-gray-100">{client?.name || 'Unknown Client'}</p>
                            <p className="text-gray-400 text-sm">{appointment.service}</p>
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1
                              ${appointment.status === 'Scheduled' ? 'bg-emerald-800 text-emerald-100' :
                                appointment.status === 'Completed' ? 'bg-green-700 text-green-100' :
                                'bg-red-700 text-red-100'
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-300 text-sm">{appointment.time}</span>
                            <div className="flex space-x-1 mt-1">
                              <button
                                onClick={() => setEditingAppointment(appointment)}
                                className="text-emerald-400 hover:text-emerald-300 p-1 rounded"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(appointment.id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />
      <ConfirmModal
        message={confirmMessage}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setConfirmMessage('');
          setConfirmAction(null);
        }}
        onCancel={() => {
          setConfirmMessage('');
          setConfirmAction(null);
        }}
      />
    </div>
  );
};

// Income View Component
const IncomeView = () => {
  const { clients, incomeEntries, addIncomeEntry, updateIncomeEntry, deleteIncomeEntry } = useContext(AppContext);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  // Form states
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [clientId, setClientId] = useState('');

  const [alertMessage, setAlertMessage] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (editingIncome) {
      setDate(editingIncome.date || '');
      setAmount(editingIncome.amount.toString() || '');
      setMethod(editingIncome.method || 'Cash');
      setNotes(editingIncome.notes || '');
      setClientId(editingIncome.clientId || '');
    } else {
      setDate('');
      setAmount('');
      setMethod('Cash');
      setNotes('');
      setClientId('');
    }
  }, [editingIncome]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!date || !amount || !method) {
      setAlertMessage('Please fill in all required fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAlertMessage('Please enter a valid amount.');
      return;
    }

    const incomeData = {
      date,
      amount: parsedAmount,
      method,
      notes: notes.trim(),
      clientId: clientId || null,
    };

    addIncomeEntry({ id: generateId(), ...incomeData });
    setAlertMessage('Income entry added successfully!');
    setIsAdding(false);
    setDate('');
    setAmount('');
    setMethod('Cash');
    setNotes('');
    setClientId('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!date || !amount || !method) {
      setAlertMessage('Please fill in all required fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAlertMessage('Please enter a valid amount.');
      return;
    }

    const incomeData = {
      date,
      amount: parsedAmount,
      method,
      notes: notes.trim(),
      clientId: clientId || null,
    };

    updateIncomeEntry({ ...editingIncome, ...incomeData });
    setAlertMessage('Income entry updated successfully!');
    setEditingIncome(null);
  };

  const handleDeleteClick = (id) => {
    setConfirmMessage('Are you sure you want to delete this income entry?');
    setConfirmAction(() => () => {
      deleteIncomeEntry(id);
      setAlertMessage('Income entry deleted successfully.');
      setConfirmMessage('');
    });
  };

  const monthlyIncome = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return incomeEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [incomeEntries]);

  const weeklyIncome = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return incomeEntries
      .filter(entry => new Date(entry.date) >= oneWeekAgo)
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [incomeEntries]);

  const dailyAverage = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEntries = incomeEntries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
    const totalAmount = recentEntries.reduce((sum, entry) => sum + entry.amount, 0);
    return totalAmount / 30;
  }, [incomeEntries]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-100">Income Tracking</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Income</span>
        </button>
      </div>

      {/* Income Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-800 to-green-900 p-4 rounded-xl border border-green-700">
          <h3 className="text-green-200 text-sm font-medium">This Month</h3>
          <p className="text-3xl font-bold text-white mt-1">${monthlyIncome.toFixed(2)}</p>
          <p className="text-green-300 text-sm mt-2">{incomeEntries.filter(e => {
            const entryDate = new Date(e.date);
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
          }).length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-4 rounded-xl border border-blue-700">
          <h3 className="text-blue-200 text-sm font-medium">This Week</h3>
          <p className="text-3xl font-bold text-white mt-1">${weeklyIncome.toFixed(2)}</p>
          <p className="text-blue-300 text-sm mt-2">{incomeEntries.filter(e => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(e.date) >= oneWeekAgo;
          }).length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-purple-800 to-purple-900 p-4 rounded-xl border border-purple-700">
          <h3 className="text-purple-200 text-sm font-medium">Daily Average</h3>
          <p className="text-3xl font-bold text-white mt-1">${dailyAverage.toFixed(2)}</p>
          <p className="text-purple-300 text-sm mt-2">Last 30 days</p>
        </div>
      </div>

      {/* Add Income Modal */}
      <EditModal
        isOpen={isAdding && !editingIncome}
        onClose={() => setIsAdding(false)}
        title="Add Income Entry"
        onSubmit={handleAddSubmit}
        submitButtonText="Add Income"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount *</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method *</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          >
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
            <option value="Digital Payment">Digital Payment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Client (Optional)</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Select client (optional)</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Service description, additional notes..."
            rows="3"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>
      </EditModal>

      {/* Edit Income Modal */}
      <EditModal
        isOpen={!!editingIncome}
        onClose={() => setEditingIncome(null)}
        title="Edit Income Entry"
        onSubmit={handleEditSubmit}
        submitButtonText="Update Income"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount *</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method *</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          >
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
            <option value="Digital Payment">Digital Payment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Client (Optional)</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Select client (optional)</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Service description, additional notes..."
            rows="3"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>
      </EditModal>

      {/* Income List */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Recent Income</h3>
        <div className="space-y-3">
          {incomeEntries.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No income entries yet</p>
          ) : (
            incomeEntries
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(entry => {
                const client = clients.find(c => c.id === entry.clientId);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        {entry.method === 'Cash' ? (
                          <Banknote className="w-5 h-5 text-white" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-100">{entry.notes || 'Income Entry'}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          {client && (
                            <>
                              <span>{client.name}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{new Date(entry.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="bg-blue-800 text-blue-200 px-2 py-0.5 rounded text-xs">
                            {entry.method}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-green-400 font-semibold text-lg">${entry.amount.toFixed(2)}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setEditingIncome(entry)}
                          className="text-emerald-400 hover:text-emerald-300 p-1 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(entry.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />
      <ConfirmModal
        message={confirmMessage}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setConfirmMessage('');
          setConfirmAction(null);
        }}
        onCancel={() => {
          setConfirmMessage('');
          setConfirmAction(null);
        }}
      />
    </div>
  );
};

// Expenses View Component
const ExpensesView = () => {
  const { expenseEntries, addExpenseEntry, updateExpenseEntry, deleteExpenseEntry } = useContext(AppContext);
  const [isAdding, setIsAdding] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form states
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Supplies');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const [alertMessage, setAlertMessage] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.date || '');
      setAmount(editingExpense.amount.toString() || '');
      setCategory(editingExpense.category || 'Supplies');
      setDescription(editingExpense.description || '');
      setReceiptUrl(editingExpense.receiptUrl || '');
    } else {
      setDate('');
      setAmount('');
      setCategory('Supplies');
      setDescription('');
      setReceiptUrl('');
    }
  }, [editingExpense]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!date || !amount || !category || !description) {
      setAlertMessage('Please fill in all required fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAlertMessage('Please enter a valid amount.');
      return;
    }

    const expenseData = {
      date,
      amount: parsedAmount,
      category,
      description: description.trim(),
      receiptUrl: receiptUrl.trim(),
    };

    addExpenseEntry({ id: generateId(), ...expenseData });
    setAlertMessage('Expense entry added successfully!');
    setIsAdding(false);
    setDate('');
    setAmount('');
    setCategory('Supplies');
    setDescription('');
    setReceiptUrl('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!date || !amount || !category || !description) {
      setAlertMessage('Please fill in all required fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAlertMessage('Please enter a valid amount.');
      return;
    }

    const expenseData = {
      date,
      amount: parsedAmount,
      category,
      description: description.trim(),
      receiptUrl: receiptUrl.trim(),
    };

    updateExpenseEntry({ ...editingExpense, ...expenseData });
    setAlertMessage('Expense entry updated successfully!');
    setEditingExpense(null);
  };

  const handleDeleteClick = (id) => {
    setConfirmMessage('Are you sure you want to delete this expense entry?');
    setConfirmAction(() => () => {
      deleteExpenseEntry(id);
      setAlertMessage('Expense entry deleted successfully.');
      setConfirmMessage('');
    });
  };

  const expensesByCategory = useMemo(() => {
    return expenseEntries.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
  }, [expenseEntries]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Supplies': return ShoppingBag;
      case 'Equipment': return Wrench;
      case 'Marketing': return Megaphone;
      default: return MoreHorizontal;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Supplies': return 'from-red-800 to-red-900 border-red-700';
      case 'Equipment': return 'from-orange-800 to-orange-900 border-orange-700';
      case 'Marketing': return 'from-yellow-800 to-yellow-900 border-yellow-700';
      default: return 'from-purple-800 to-purple-900 border-purple-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-100">Expense Tracking</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expense Categories */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['Supplies', 'Equipment', 'Marketing', 'Other'].map(category => {
          const Icon = getCategoryIcon(category);
          const amount = expensesByCategory[category] || 0;
          const colorClass = getCategoryColor(category);
          
          return (
            <div key={category} className={`bg-gradient-to-br ${colorClass} p-4 rounded-xl border`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium opacity-90">{category}</p>
                  <p className="text-2xl font-bold text-white mt-1">${amount.toFixed(2)}</p>
                </div>
                <Icon className="w-8 h-8 text-white opacity-75" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Expense Modal */}
      <EditModal
        isOpen={isAdding && !editingExpense}
        onClose={() => setIsAdding(false)}
        title="Add Expense Entry"
        onSubmit={handleAddSubmit}
        submitButtonText="Add Expense"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount *</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          >
            <option value="Supplies">Supplies</option>
            <option value="Equipment">Equipment</option>
            <option value="Marketing">Marketing</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you buy?"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Receipt URL (Optional)</label>
          <input
            type="url"
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            placeholder="https://example.com/receipt.pdf"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </EditModal>

      {/* Edit Expense Modal */}
      <EditModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        title="Edit Expense Entry"
        onSubmit={handleEditSubmit}
        submitButtonText="Update Expense"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount *</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-emerald-500 focus:outline-none"
            required
          >
            <option value="Supplies">Supplies</option>
            <option value="Equipment">Equipment</option>
            <option value="Marketing">Marketing</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you buy?"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Receipt URL (Optional)</label>
          <input
            type="url"
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            placeholder="https://example.com/receipt.pdf"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </EditModal>

      {/* Expenses List */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Recent Expenses</h3>
        <div className="space-y-3">
          {expenseEntries.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No expense entries yet</p>
          ) : (
            expenseEntries
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(expense => {
                const Icon = getCategoryIcon(expense.category);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-100">{expense.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="bg-red-800 text-red-200 px-2 py-0.5 rounded text-xs">
                            {expense.category}
                          </span>
                          {expense.receiptUrl && (
                            <>
                              <span>•</span>
                              <a
                                href={expense.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs"
                              >
                                View Receipt
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-red-400 font-semibold text-lg">-${expense.amount.toFixed(2)}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="text-emerald-400 hover:text-emerald-300 p-1 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />
      <ConfirmModal
        message={confirmMessage}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setConfirmMessage('');
          setConfirmAction(null);
        }}
        onCancel={() => {
          setConfirmMessage('');
          setConfirmAction(null);
        }}
      />
    </div>
  );
};

// Main ClearKeep Component
const ClearKeep = () => {
  const [currentView, setCurrentView] = useState('summary');
  const [showIntro, setShowIntro] = useState(true);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);

  // App data states
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('clearKeepData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setClients(parsed.clients || []);
        setAppointments(parsed.appointments || []);
        setIncomeEntries(parsed.incomeEntries || []);
        setExpenseEntries(parsed.expenseEntries || []);
        setShowIntro(false);
        
        // Check for backup reminder
        setTimeout(() => {
          if (checkBackupReminder()) {
            setShowBackupReminder(true);
          }
        }, 5000); // Show after 5 seconds
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!showIntro) {
      const dataToSave = {
        clients,
        appointments,
        incomeEntries,
        expenseEntries,
      };
      localStorage.setItem('clearKeepData', JSON.stringify(dataToSave));
    }
  }, [clients, appointments, incomeEntries, expenseEntries, showIntro]);

  // CRUD functions
  const addClient = (client) => {
    setClients(prev => [...prev, client]);
  };

  const updateClient = (updatedClient) => {
    setClients(prev => prev.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
  };

  const deleteClient = (clientId) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
    setAppointments(prev => prev.filter(appointment => appointment.clientId !== clientId));
    setIncomeEntries(prev => prev.filter(income => income.clientId !== clientId));
  };

  const addAppointment = (appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const updateAppointment = (updatedAppointment) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    ));
  };

  const deleteAppointment = (appointmentId) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
  };

  const addIncomeEntry = (income) => {
    setIncomeEntries(prev => [...prev, income]);
  };

  const updateIncomeEntry = (updatedIncome) => {
    setIncomeEntries(prev => prev.map(income => 
      income.id === updatedIncome.id ? updatedIncome : income
    ));
  };

  const deleteIncomeEntry = (incomeId) => {
    setIncomeEntries(prev => prev.filter(income => income.id !== incomeId));
  };

  const addExpenseEntry = (expense) => {
    setExpenseEntries(prev => [...prev, expense]);
  };

  const updateExpenseEntry = (updatedExpense) => {
    setExpenseEntries(prev => prev.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    ));
  };

  const deleteExpenseEntry = (expenseId) => {
    setExpenseEntries(prev => prev.filter(expense => expense.id !== expenseId));
  };

  // Data management functions
  const loadDemoData = () => {
    setClients(DEMO_DATA.clients);
    setAppointments(DEMO_DATA.appointments);
    setIncomeEntries(DEMO_DATA.incomeEntries);
    setExpenseEntries(DEMO_DATA.expenseEntries);
    setShowIntro(false);
  };

  const startFresh = () => {
    setClients([]);
    setAppointments([]);
    setIncomeEntries([]);
    setExpenseEntries([]);
    setShowIntro(false);
  };

  const exportData = () => {
    const dataToExport = {
      clients,
      appointments,
      incomeEntries,
      expenseEntries,
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearkeep-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Update backup reminder timestamp
    localStorage.setItem('lastBackupReminder', new Date().getTime().toString());
    
    setShowDataManagement(false);
    setShowBackupReminder(false);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            setClients(importedData.clients || []);
            setAppointments(importedData.appointments || []);
            setIncomeEntries(importedData.incomeEntries || []);
            setExpenseEntries(importedData.expenseEntries || []);
            setShowDataManagement(false);
          } catch (error) {
            alert('Error importing data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetToDemo = () => {
    if (confirm('This will replace all your data with demo data. Are you sure?')) {
      loadDemoData();
      setShowDataManagement(false);
    }
  };

  const clearAllData = () => {
    if (confirm('This will permanently delete all your data. Are you sure?')) {
      setClients([]);
      setAppointments([]);
      setIncomeEntries([]);
      setExpenseEntries([]);
      localStorage.removeItem('clearKeepData');
      setShowDataManagement(false);
    }
  };

  const contextValue = {
    clients,
    appointments,
    incomeEntries,
    expenseEntries,
    addClient,
    updateClient,
    deleteClient,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addIncomeEntry,
    updateIncomeEntry,
    deleteIncomeEntry,
    addExpenseEntry,
    updateExpenseEntry,
    deleteExpenseEntry,
    setCurrentView,
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'clients':
        return <ClientsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'income':
        return <IncomeView />;
      case 'expenses':
        return <ExpensesView />;
      default:
        return <SummaryView />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {showIntro && (
        <IntroModal
          isOpen={showIntro}
          onClose={() => setShowIntro(false)}
          onTryDemo={loadDemoData}
          onStartFresh={startFresh}
        />
      )}

      <DataManagementModal
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
        onExport={exportData}
        onImport={importData}
        onReset={resetToDemo}
        onClear={clearAllData}
      />

      <BackupReminderModal
        isOpen={showBackupReminder}
        onClose={() => {
          setShowBackupReminder(false);
          localStorage.setItem('lastBackupReminder', new Date().getTime().toString());
        }}
        onBackupNow={exportData}
      />

      {!showIntro && (
        <>
          <MainLayout currentView={currentView} setCurrentView={setCurrentView}>
            {renderCurrentView()}
          </MainLayout>

          {/* Floating Action Button */}
          <button
            onClick={() => setShowDataManagement(true)}
            className="fixed bottom-24 right-4 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center z-30 hover:scale-110"
          >
            <Settings size={24} />
          </button>
        </>
      )}
    </AppContext.Provider>
  );
};

export default ClearKeep;
