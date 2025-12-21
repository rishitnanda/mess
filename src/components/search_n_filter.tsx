import { useState } from 'react';
import { Search, Filter, X, Calendar, DollarSign, Clock } from 'lucide-react';

const MESS_OPTIONS = ['All', 'Mess 1 - Veg', 'Mess 1 - Non-Veg', 'Mess 2', 'Mess 3'];
const MEAL_TIMES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const LISTING_TYPES = ['All', 'Auction', 'Instant'];

interface Filters {
  searchQuery: string;
  mess: string;
  mealTime: string;
  listingType: string;
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
}

interface SearchFilterProps {
  darkMode: boolean;
  onFilterChange: (filters: Filters) => void;
}

export default function SearchFilter({ darkMode, onFilterChange }: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    mess: 'All',
    mealTime: 'All',
    listingType: 'All',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: ''
  });

  const updateFilter = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: Filters = {
      searchQuery: '',
      mess: 'All',
      mealTime: 'All',
      listingType: 'All',
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: ''
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchQuery') return false;
    if (value === 'All' || value === '') return false;
    return true;
  }).length;

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search listings..."
            className={`w-full pl-12 pr-4 py-3 border-2 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-200 placeholder-gray-400'
            } rounded-lg focus:outline-none focus:border-blue-500`}
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-lg border-2 font-semibold flex items-center gap-2 ${
            showFilters || activeFilterCount > 0
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : darkMode
              ? 'border-gray-700 hover:bg-gray-800'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={`mt-4 p-4 rounded-lg border-2 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mess Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Mess</label>
              <select
                value={filters.mess}
                onChange={(e) => updateFilter('mess', e.target.value)}
                className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-2`}
              >
                {MESS_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Meal Time Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Meal Time</label>
              <select
                value={filters.mealTime}
                onChange={(e) => updateFilter('mealTime', e.target.value)}
                className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-2`}
              >
                {MEAL_TIMES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={filters.listingType}
                onChange={(e) => updateFilter('listingType', e.target.value)}
                className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-2`}
              >
                {LISTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-2`}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className={`w-full border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-2`}
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => updateFilter('priceMin', e.target.value)}
                  placeholder="Min"
                  className={`w-1/2 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-2`}
                />
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => updateFilter('priceMax', e.target.value)}
                  placeholder="Max"
                  className={`w-1/2 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-2`}
                />
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <p className="text-sm font-medium mb-2">Quick Filters</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  updateFilter('dateFrom', new Date().toISOString().split('T')[0]);
                  updateFilter('dateTo', new Date().toISOString().split('T')[0]);
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                } border border-gray-300 dark:border-gray-600`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  updateFilter('dateFrom', tomorrow.toISOString().split('T')[0]);
                  updateFilter('dateTo', tomorrow.toISOString().split('T')[0]);
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                } border border-gray-300 dark:border-gray-600`}
              >
                Tomorrow
              </button>
              <button
                onClick={() => updateFilter('listingType', 'Auction')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                } border border-gray-300 dark:border-gray-600`}
              >
                Auctions Only
              </button>
              <button
                onClick={() => {
                  updateFilter('priceMin', '0');
                  updateFilter('priceMax', '50');
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                } border border-gray-300 dark:border-gray-600`}
              >
                Under ₹50
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}