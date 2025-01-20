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
import { MagnifyingGlassIcon, MapPinIcon, ChartPieIcon, ListBulletIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Layout from './components/Layout';
import SearchInput from './components/SearchInput';
import SentimentChart from './components/charts/SentimentChart';
import EmotionsChart from './components/charts/EmotionsChart';
import { exportToCSV } from './utils/helper';
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
      console.error('Error fetching data:', err);
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

  // const exportToCSV = () => {
  //   const headers = ['Name', 'Category', 'Sentiment', 'Latitude', 'Longitude'];
  //   const csvData = pois.map(poi => [
  //     poi.name,
  //     poi.category,
  //     poi.sentiment.label,
  //     poi.location.coordinates[1],
  //     poi.location.coordinates[0],
  //   ]);

  //   const csvContent = [
  //     headers.join(','),
  //     ...csvData.map(row => row.join(',')),
  //   ].join('\n');

  //   const blob = new Blob([csvContent], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.setAttribute('hidden', '');
  //   a.setAttribute('href', url);
  //   a.setAttribute('download', 'pois_data.csv');
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'emerald';
      case 'negative':
        return 'rose';
      default:
        return 'gray';
    }
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
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <SearchInput
                value={searchTerm}
                onChange={handleSearchChange}
                minLength={2}
                placeholder="Search POIs..."
                className="mb-2 md:mb-0"
              />
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
                className="min-w-[200px]"
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
                onClick={()=>exportToCSV(pois)}
                color="blue"
                className="whitespace-nowrap"
              >
                Export
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
                <Text>Loading data...</Text>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Analytics Overview */}
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
              <Card decoration="top" decorationColor="blue">
                <Text>Total POIs</Text>
                <Metric>{pois.length}</Metric>
              </Card>
              <Card decoration="top" decorationColor="emerald">
                <Text>Categories</Text>
                <Metric>{categories.length}</Metric>
              </Card>
              <Card decoration="top" decorationColor="amber">
                <Text>Current Page</Text>
                <Metric>{currentPage} of {totalPages}</Metric>
              </Card>
            </Grid>

            {/* Main Content Tabs */}
            <Card>
              <TabGroup 
                index={selectedView} 
                onIndexChange={handleViewChange}
              >
                <TabList className="mb-6">
                  <Tab icon={ChartPieIcon}>Analytics</Tab>
                  <Tab icon={MapPinIcon}>Map View</Tab>
                  <Tab icon={ListBulletIcon}>List View</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    <Grid numItems={1} numItemsSm={2} className="gap-6">
                      {sentimentData.length > 0 && (
                        <Card>
                          <Title>Sentiment Distribution</Title>
                          <SentimentChart data={sentimentData} />
                        </Card>
                      )}
                      {emotionsData && (
                        <Card>
                          <Title>Emotion Analysis</Title>
                          <EmotionsChart data={emotionsData} />
                        </Card>
                      )}
                    </Grid>
                  </TabPanel>

                  <TabPanel>
                    <Card>
                      <Title>POIs Map</Title>
                      <div className="h-[600px] mt-4">
                        <Map data={geoData} />
                      </div>
                    </Card>
                  </TabPanel>

                  <TabPanel>
                    <Card>
                      <Title>POIs List</Title>
                      <div className="mt-6">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableHeaderCell>Name</TableHeaderCell>
                              <TableHeaderCell>Category</TableHeaderCell>
                              <TableHeaderCell>Sentiment</TableHeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pois.map((poi) => (
                              <TableRow key={poi._id}>
                                <TableCell>{poi.name}</TableCell>
                                <TableCell>
                                  <Badge size="sm">{poi.category}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    size="sm"
                                    color={getSentimentColor(poi.sentiment.label)}
                                  >
                                    {poi.sentiment.label}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {/* Pagination Controls */}
                        <div className="flex justify-center gap-2 mt-6">
                          <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            size="xs"
                            color="gray"
                          >
                            Previous
                          </Button>
                          <Text className="px-4 py-2">
                            Page {currentPage} of {totalPages}
                          </Text>
                          <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            size="xs"
                            color="gray"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
