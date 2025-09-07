import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon,
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BuildingOfficeIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { transactionService } from '../services/api';
import type { Transaction, FilterOptions, SortOptions } from '../types';
import { formatCurrency, formatDate, getStatusColor } from '../utils/format';
import toast from 'react-hot-toast';

interface Institute {
  id: string;
  name: string;
}

const SchoolTransactions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState(searchParams.get('schoolId') || '');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterOptions>({
    status: searchParams.get('status')?.split(',') || [],
    search: searchParams.get('search') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  });
  
  const [sort, setSort] = useState<SortOptions>({
    field: searchParams.get('sortField') || 'payment_time',
    direction: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc',
  });
  
  const [rowsPerPage, setRowsPerPage] = useState(parseInt(searchParams.get('limit') || '10'));
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get('filterBy') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('dateFilter') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('statusFilter') || '');

  const institutes: Institute[] = [
    { id: '65b0e6293e9f76a9694d84b4', name: 'Bhavans Newsprint Vidyalaya Velloor' },
    { id: '65b0e6293e9f76a9694d84b5', name: 'Bharativa Vidya Bhavan Kadungalloor' },
    { id: '65b0e6293e9f76a9694d84b6', name: 'Delhi Public School' },
    { id: '65b0e6293e9f76a9694d84b7', name: 'St. Mary\'s School' },
    { id: '65b0e6293e9f76a9694d84b8', name: 'Modern School' },
  ];

  // Update URL params when filters change
  const updateURLParams = (newFilters: FilterOptions, newSort: SortOptions, newPagination: any) => {
    const params = new URLSearchParams();
    
    if (selectedSchoolId) params.set('schoolId', selectedSchoolId);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.status?.length) params.set('status', newFilters.status.join(','));
    if (newFilters.dateFrom) params.set('dateFrom', newFilters.dateFrom);
    if (newFilters.dateTo) params.set('dateTo', newFilters.dateTo);
    if (newSort.field) params.set('sortField', newSort.field);
    if (newSort.direction) params.set('sortDirection', newSort.direction);
    if (newPagination.currentPage > 1) params.set('page', newPagination.currentPage.toString());
    if (rowsPerPage !== 10) params.set('limit', rowsPerPage.toString());
    if (selectedFilter) params.set('filterBy', selectedFilter);
    if (selectedDate) params.set('dateFilter', selectedDate);
    if (selectedStatus) params.set('statusFilter', selectedStatus);
    
    setSearchParams(params);
  };

  useEffect(() => {
    if (selectedSchoolId) {
      loadTransactions();
    }
  }, [selectedSchoolId, pagination.currentPage, sort, filters, rowsPerPage]);

  const loadTransactions = async () => {
    if (!selectedSchoolId) return;

    try {
      setLoading(true);
      const response = await transactionService.getTransactionsBySchool(
        selectedSchoolId,
        { page: pagination.currentPage, limit: rowsPerPage },
        sort,
        filters
      );
      
      setTransactions(response.transactions);
      setPagination(response.pagination);
      updateURLParams(filters, sort, pagination);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setPagination({ ...pagination, currentPage: 1 });
    updateURLParams(filters, sort, { ...pagination, currentPage: 1 });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    setPagination({ ...pagination, currentPage: 1 });
    updateURLParams(newFilters, sort, { ...pagination, currentPage: 1 });
  };

  const handleSort = (field: string) => {
    const newSort: SortOptions = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    };
    setSort(newSort);
    updateURLParams(filters, newSort, pagination);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPagination({ ...pagination, currentPage: 1 });
    updateURLParams(filters, sort, { ...pagination, currentPage: 1 });
  };

  const handleFilterByChange = (filterBy: string) => {
    setSelectedFilter(filterBy);
    updateURLParams(filters, sort, pagination);
  };

  const handleDateFilterChange = (dateFilter: string) => {
    setSelectedDate(dateFilter);
    updateURLParams(filters, sort, pagination);
  };

  const handleStatusFilterChange = (statusFilter: string) => {
    setSelectedStatus(statusFilter);
    if (statusFilter) {
      const newFilters = { ...filters, status: [statusFilter] };
      setFilters(newFilters);
      updateURLParams(newFilters, sort, pagination);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Order ID copied to clipboard');
  };

  const getInstituteName = (schoolId: string) => {
    const institute = institutes.find(inst => inst.id === schoolId);
    return institute ? institute.name : 'Unknown Institute';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions by School</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View transactions for a specific school</p>
        </div>

        {/* School Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
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
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a school...</option>
                {institutes.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedSchoolId && (
          <>
            {/* Filter Section - Matching the image layout */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Search Input */}
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search(Order ID...)"
                      value={filters.search}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Rows per page */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</label>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Filter By Dropdown */}
                <div className="relative">
                  <select
                    value={selectedFilter}
                    onChange={(e) => handleFilterByChange(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32"
                  >
                    <option value="">Filter By</option>
                    <option value="amount">Amount</option>
                    <option value="date">Date</option>
                    <option value="gateway">Gateway</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Date Dropdown */}
                <div className="relative">
                  <select
                    value={selectedDate}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32"
                  >
                    <option value="">Date</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32"
                  >
                    <option value="">Status</option>
                    <option value="Success">Success</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Transactions Table - Matching the image structure */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <SortButton field="collect_id">Sr.No</SortButton>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <SortButton field="school_id">Institute Name</SortButton>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <SortButton field="payment_time">Date & Time</SortButton>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <SortButton field="custom_order_id">Order ID</SortButton>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <SortButton field="order_amount">Order Amt</SortButton>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <SortButton field="transaction_amount">Transaction Amt</SortButton>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <SortButton field="gateway">Payment Method</SortButton>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <SortButton field="status">Status</SortButton>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Phone No
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map((transaction, index) => (
                        <tr 
                          key={transaction.collect_id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                            <div className="max-w-xs truncate" title={getInstituteName(transaction.school_id)}>
                              {getInstituteName(transaction.school_id)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {transaction.payment_time ? formatDate(transaction.payment_time) : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{transaction.custom_order_id}</span>
                              <button
                                onClick={() => copyToClipboard(transaction.custom_order_id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(transaction.order_amount)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(transaction.transaction_amount)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {transaction.payment_mode || transaction.gateway}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {transaction.student_info?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            N/A
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sm:px-6">
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
                        {((pagination.currentPage - 1) * rowsPerPage) + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * rowsPerPage, pagination.totalCount)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default SchoolTransactions;