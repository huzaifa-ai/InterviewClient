'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Grid,
  Card,
  Title,
  Select,
  SelectItem,
  Button,
  Badge,
  Text,
  Metric,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell
} from '@tremor/react';
import { MapPinIcon, ChartPieIcon, ListBulletIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Layout from './components/Layout';
import SearchInput from './components/SearchInput';
import SentimentChart from './components/charts/SentimentChart';
import EmotionsChart from './components/charts/EmotionsChart';
import { exportToCSV } from './utils/helper';
import { getSentimentColor } from './utils/helper';

import Map from './components/Map';
import {
  fetchPOIs,
  fetchSentimentAnalytics,
  fetchCategoryAnalytics,
  fetchGeoData,
  fetchEmotionAnalytics,
  type POI
} from './utils/api';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL states
  const currentPage = Number(searchParams.get('page')) || 1;
  const selectedCategory = searchParams.get('category') || 'all';
  const urlSearchQuery = searchParams.get('search') || '';
  const selectedView = Number(searchParams.get('view')) || 0;
  
  // Local states
  const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearchQuery);
  const [pois, setPois] = useState<POI[]>([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [emotionsData, setEmotionsData] = useState({
    avgJoy: 0,
    avgSadness: 0,
    avgFear: 0,
    avgDisgust: 0,
    avgAnger: 0,
    avgHappy: 0,
    avgCalm: 0,
    avgNone: 0
  });
  const [geoData, setGeoData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle URL updates
  const updateUrlParams = useCallback((updates: Record<string, string | number | null>, replaceState = false) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });
    
    const search = current.toString();
    const query = search ? `?${search}` : '';
    
    if (replaceState) {
      router.replace(`${window.location.pathname}${query}`, { scroll: false });
    } else {
      router.push(`${window.location.pathname}${query}`, { scroll: false });
    }
  }, [router, searchParams]);

  // Debounce search term updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setDebouncedSearchTerm(searchTerm);
        // When search changes, reset to page 1 and update URL
        updateUrlParams({ search: searchTerm || null, page: 1 }, true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm, updateUrlParams]);

  // Sync URL search with local state when URL changes externally
  useEffect(() => {
    if (urlSearchQuery !== searchTerm) {
      setSearchTerm(urlSearchQuery);
      setDebouncedSearchTerm(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        poisResponse,
        sentimentAnalytics,
        categoryAnalytics,
        emotionAnalytics,
        geoAnalytics,
      ] = await Promise.all([
        fetchPOIs({
          page: currentPage,
          limit: 50,
          category: selectedCategory,
          search: debouncedSearchTerm
        }),
        fetchSentimentAnalytics(),
        fetchCategoryAnalytics(),
        fetchEmotionAnalytics(),
        fetchGeoData({ category: selectedCategory })
      ]);

      setPois(poisResponse.data);
      setTotalPages(poisResponse.pagination.totalPages);
      setSentimentData(sentimentAnalytics);
      
      const processedEmotions = {
        avgJoy: Number(emotionAnalytics?.avgJoy?.toFixed(2)) || 0,
        avgSadness: Number(emotionAnalytics?.avgSadness?.toFixed(2)) || 0,
        avgFear: Number(emotionAnalytics?.avgFear?.toFixed(2)) || 0,
        avgDisgust: Number(emotionAnalytics?.avgDisgust?.toFixed(2)) || 0,
        avgAnger: Number(emotionAnalytics?.avgAnger?.toFixed(2)) || 0,
        avgHappy: Number(emotionAnalytics?.avgHappy?.toFixed(2)) || 0,
        avgCalm: Number(emotionAnalytics?.avgCalm?.toFixed(2)) || 0,
        avgNone: Number(emotionAnalytics?.avgNone?.toFixed(2)) || 0
      };
      
      setEmotionsData(processedEmotions);
      setGeoData(geoAnalytics);
      setCategories(categoryAnalytics.map((cat:any) => cat._id));
    } catch (err) {
      setError('Error loading data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch when URL parameters change
  useEffect(() => {
    fetchData();
  }, [currentPage, selectedCategory, debouncedSearchTerm]);

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handleCategoryChange = (category: string) => {
    updateUrlParams({ category: category === 'all' ? null : category, page: 1 });
  };

  const handleViewChange = (index: number) => {
    updateUrlParams({ view: index === 0 ? null : index });
  };

  if (error) {
    return (
      <Layout>
        <Card className="mt-4">
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <Text className="text-red-600 text-lg mb-2">⚠️ {error}</Text>
              <Button onClick={fetchData} size="xs">Retry</Button>
            </div>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading data...</p>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-8 mb-6">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">POI Analytics Dashboard</h1>
            <p className="text-blue-100">Analyzing {pois.length} Points of Interest across {categories.length} categories</p>
            
            <div className="mt-6">
              <SearchInput
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search POIs..."
                className="w-full max-w-lg"
              />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <MapPinIcon className="w-full h-full" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card 
            className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900"
            decoration="left"
            decorationColor="blue"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <Text className="text-sm text-blue-600 dark:text-blue-300">Total POIs</Text>
                <Metric className="text-2xl font-bold text-blue-900 dark:text-blue-50">{pois.length}</Metric>
              </div>
            </div>
          </Card>

          <Card 
            className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900"
            decoration="left"
            decorationColor="emerald"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                <ListBulletIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <Text className="text-sm text-emerald-600 dark:text-emerald-300">Categories</Text>
                <Metric className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">{categories.length}</Metric>
              </div>
            </div>
          </Card>

          <Card 
            className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-900"
            decoration="left"
            decorationColor="amber"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-lg">
                <ChartPieIcon className="w-6 h-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <Text className="text-sm text-amber-600 dark:text-amber-300">Positive Sentiment</Text>
                <Metric className="text-2xl font-bold text-amber-900 dark:text-amber-50">
                  {Math.round((pois.filter(p => p.sentiment.label === 'Positive').length / pois.length) * 100)}%
                </Metric>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <ChartPieIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <Title>Analytics Overview</Title>
              </div>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                  className="min-w-[150px]"
                >
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
                <Button 
                  icon={ArrowDownTrayIcon}
                  onClick={() => exportToCSV(pois)}
                  color="blue"
                  className="whitespace-nowrap hover:shadow-lg transition-shadow"
                >
                  Export Data
                </Button>
              </div>
            </div>
          </div>

          <TabGroup 
            index={selectedView} 
            onIndexChange={handleViewChange}
          >
            <TabList className="p-1 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <Tab 
                className="px-6 py-3 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                icon={ChartPieIcon}
              >
                Analytics
              </Tab>
              <Tab 
                className="px-6 py-3 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                icon={MapPinIcon}
              >
                Map View
              </Tab>
              <Tab 
                className="px-6 py-3 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                icon={ListBulletIcon}
              >
                List View
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow">
                      <Title>Sentiment Distribution</Title>
                      <div className="mt-4">
                        <SentimentChart data={sentimentData} />
                      </div>
                    </Card>
                    <Card className="shadow-lg hover:shadow-xl transition-shadow">
                      <Title>Emotion Analysis</Title>
                      <div className="mt-4">
                        <EmotionsChart data={emotionsData} />
                      </div>
                    </Card>
                  </div>
                </div>
              </TabPanel>

              <TabPanel>
                <div className="p-6">
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <Title>Geographic Distribution</Title>
                    <div className="h-[600px] mt-4 rounded-lg overflow-hidden">
                      <Map data={geoData} />
                    </div>
                  </Card>
                </div>
              </TabPanel>

              <TabPanel>
                <div className="p-6">
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHead>
                          <TableRow className="bg-gray-50 dark:bg-gray-900">
                            <TableHeaderCell className="font-semibold">Name</TableHeaderCell>
                            <TableHeaderCell className="font-semibold">Category</TableHeaderCell>
                            <TableHeaderCell className="font-semibold">Sentiment</TableHeaderCell>
                            <TableHeaderCell className="font-semibold">Location</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pois.map((poi) => (
                            <TableRow 
                              key={poi._id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                              <TableCell className="font-medium">{poi.name}</TableCell>
                              <TableCell>
                                <Badge 
                                  size="sm"
                                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  {poi.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  size="sm"
                                  color={getSentimentColor(poi.sentiment.label)}
                                  className="shadow-sm"
                                >
                                  {poi.sentiment.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-500 dark:text-gray-400">
                                {poi.location.coordinates[1].toFixed(4)}, {poi.location.coordinates[0].toFixed(4)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-6 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-between items-center">
                      <Text className="text-gray-600 dark:text-gray-300">
                        Showing {pois.length} of {totalPages * 50} POIs
                      </Text>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          variant="secondary"
                          size="sm"
                          className="hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Previous
                        </Button>
                        <Text className="text-gray-600 dark:text-gray-300">
                          Page {currentPage} of {totalPages}
                        </Text>
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          variant="secondary"
                          size="sm"
                          className="hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Card>
      </div>
    </Layout>
  );
}
