import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { transactionService } from '../services/api';
import type { Transaction } from '../types';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    successCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getAllTransactions(
        { page: 1, limit: 10 },
        { field: 'payment_time', direction: 'desc' }
      );
      
      setTransactions(response.transactions);
      
      // Calculate stats
      const totalAmount = response.transactions.reduce((sum, t) => sum + t.transaction_amount, 0);
      const successCount = response.transactions.filter(t => t.status === 'success').length;
      const pendingCount = response.transactions.filter(t => t.status === 'pending').length;
      const failedCount = response.transactions.filter(t => t.status === 'failed').length;
      
      setStats({
        totalTransactions: response.pagination.totalCount,
        totalAmount,
        successCount,
        pendingCount,
        failedCount,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Transactions',
      value: stats.totalTransactions.toLocaleString(),
      icon: ChartBarIcon,
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      name: 'Total Amount',
      value: formatCurrency(stats.totalAmount),
      icon: CurrencyDollarIcon,
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      name: 'Successful',
      value: stats.successCount.toString(),
      icon: CheckCircleIcon,
      change: '+5%',
      changeType: 'increase' as const,
      color: 'text-green-600',
    },
    {
      name: 'Pending',
      value: stats.pendingCount.toString(),
      icon: ClockIcon,
      change: '-2%',
      changeType: 'decrease' as const,
      color: 'text-yellow-600',
    },
    {
      name: 'Failed',
      value: stats.failedCount.toString(),
      icon: XCircleIcon,
      change: '-1%',
      changeType: 'decrease' as const,
      color: 'text-red-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your school payment transactions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((item) => (
          <div key={item.name} className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon
                  className={`h-6 w-6 ${item.color || 'text-gray-400'}`}
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {item.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.changeType === 'increase' ? (
                        <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      )}
                      <span className="sr-only">
                        {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                      </span>
                      {item.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No transactions
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new transaction.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction.collect_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.custom_order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {transaction.gateway}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(transaction.transaction_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          transaction.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {transaction.payment_time ? new Date(transaction.payment_time).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
