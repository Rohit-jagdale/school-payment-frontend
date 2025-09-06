import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { transactionService } from '../services/api';
import type { Transaction, FilterOptions, SortOptions } from '../types';
import { formatCurrency, formatDate, getStatusColor, getGatewayColor } from '../utils/format';
import toast from 'react-hot-toast';

const SchoolTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    search: '',
  });
  const [sort, setSort] = useState<SortOptions>({
    field: 'payment_time',
    direction: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const schoolIds = [
    { id: '65b0e6293e9f76a9694d84b4', name: 'Delhi Public School' },
    { id: '65b0e6293e9f76a9694d84b5', name: 'St. Mary\'s School' },
    { id: '65b0e6293e9f76a9694d84b6', name: 'Modern School' },
  ];

  const statusOptions = [
    { value: 'success', label: 'Success' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    if (selectedSchoolId) {
      loadTransactions();
    }
  }, [selectedSchoolId, pagination.currentPage, sort, filters]);

  const loadTransactions = async () => {
    if (!selectedSchoolId) return;

    try {
      setLoading(true);
      const response = await transactionService.getTransactionsBySchool(
        selectedSchoolId,
        { page: pagination.currentPage, limit: 10 },
        sort,
        filters
      );
      
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleStatusFilter = (status: string) => {
    const newStatus = filters.status?.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...(filters.status || []), status];
    
    setFilters({ ...filters, status: newStatus });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleSort = (field: string) => {
    setSort({
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const clearFilters = () => {
    setFilters({ status: [], search: '' });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const SortButton: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-100"
    >
      <span>{children}</span>
      {sort.field === field && (
        sort.direction === 'asc' ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions by School</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View transactions for a specific school
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center space-x-2"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* School Selection */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <label htmlFor="school-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select School
            </label>
            <select
              id="school-select"
              value={selectedSchoolId}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className="mt-1 input"
            >
              <option value="">Choose a school...</option>
              {schoolIds.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedSchoolId && (
        <>
          {/* Search and Filters */}
          <div className="card p-4">
            <div className="flex flex-col space-y-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={handleSearch}
                  className="input pl-10"
                />
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleStatusFilter(option.value)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${
                              filters.status?.includes(option.value)
                                ? 'bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:border-primary-700'
                                : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No transactions found for the selected school.
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3">
                        <SortButton field="custom_order_id">Transaction ID</SortButton>
                      </th>
                      <th className="px-6 py-3">
                        <SortButton field="gateway">Gateway</SortButton>
                      </th>
                      <th className="px-6 py-3">
                        <SortButton field="order_amount">Order Amount</SortButton>
                      </th>
                      <th className="px-6 py-3">
                        <SortButton field="transaction_amount">Transaction Amount</SortButton>
                      </th>
                      <th className="px-6 py-3">
                        <SortButton field="status">Status</SortButton>
                      </th>
                      <th className="px-6 py-3">
                        <SortButton field="payment_time">Date</SortButton>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <tr key={transaction.collect_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.custom_order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGatewayColor(transaction.gateway)}`}>
                            {transaction.gateway}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(transaction.order_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(transaction.transaction_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.payment_time ? formatDate(transaction.payment_time) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                    disabled={!pagination.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{' '}
                      <span className="font-medium">
                        {((pagination.currentPage - 1) * 10) + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * 10, pagination.totalCount)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.totalCount}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setPagination({ ...pagination, currentPage: page })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900 dark:border-primary-700 dark:text-primary-200'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SchoolTransactions;
