import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { transactionService } from '../services/api';
import { formatCurrency, formatDate, getStatusColor, getGatewayColor } from '../utils/format';
import toast from 'react-hot-toast';

const StatusCheck: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await transactionService.getTransactionStatus(orderId);
      setTransaction(response);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Transaction not found');
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-8 w-8 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-8 w-8 text-gray-500" />;
      default:
        return <ClockIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Status Check</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enter a transaction ID to check its current status
        </p>
      </div>

      {/* Search Form */}
      <div className="card p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="order-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction ID
            </label>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="order-id"
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter transaction ID (e.g., ORDER_001)"
                  className="input pl-10"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !orderId.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Check Status'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      {error && (
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <XCircleIcon className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {transaction && (
        <div className="space-y-6">
          {/* Transaction Status Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(transaction.status)}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Transaction Status
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {transaction.custom_order_id}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Transaction Details
              </h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction ID</dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">{transaction.custom_order_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">School ID</dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">{transaction.school_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gateway</dt>
                  <dd className="text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGatewayColor(transaction.gateway)}`}>
                      {transaction.gateway}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Mode</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{transaction.payment_mode || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Reference</dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">{transaction.bank_reference || 'N/A'}</dd>
                </div>
              </dl>
            </div>

            {/* Financial Information */}
            <div className="card p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Financial Details
              </h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Amount</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(transaction.order_amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Amount</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(transaction.transaction_amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Time</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {transaction.payment_time ? formatDate(transaction.payment_time) : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Message</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {transaction.payment_message || 'N/A'}
                  </dd>
                </div>
                {transaction.error_message && transaction.error_message !== 'NA' && (
                  <div>
                    <dt className="text-sm font-medium text-red-500 dark:text-red-400">Error Message</dt>
                    <dd className="text-sm text-red-600 dark:text-red-400">
                      {transaction.error_message}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Student Information */}
          {transaction.student_info && (
            <div className="card p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Student Information
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{transaction.student_info.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Student ID</dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">{transaction.student_info.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{transaction.student_info.email}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              How to find your Transaction ID
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Check your email for payment confirmation</li>
                <li>Look in your transaction history</li>
                <li>Contact your school administrator</li>
                <li>Transaction IDs typically start with "ORDER_" followed by numbers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCheck;
