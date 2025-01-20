import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface POI {
  _id: string;
  name: string;
  category: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  sentiment: {
    label: string;
    score: number;
  };
  emotions: {
    joy: number;
    sadness: number;
    fear: number;
    disgust: number;
    anger: number;
  };
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sentiment?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const fetchPOIs = async (params: PaginationParams = {}): Promise<PaginatedResponse<POI>> => {
  try {
    const { page = 1, limit = 50, category, search, sentiment } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && category !== 'all' && { category }),
      ...(search && { search }),
      ...(sentiment && { sentiment })
    });

    const response = await axios.get<PaginatedResponse<POI>>(`${API_BASE_URL}/pois?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching POIs:', error);
    return {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        hasMore: false
      }
    };
  }
};

export const fetchSentimentAnalytics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/sentiment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sentiment analytics:', error);
    return [];
  }
};

export const fetchCategoryAnalytics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    return [];
  }
};

export const fetchEmotionAnalytics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/emotions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching emotion analytics:', error);
    return null;
  }
};

export const fetchGeoData = async (params: { category?: string; sentiment?: string } = {}) => {
  try {
    const { category, sentiment } = params;
    const queryParams = new URLSearchParams({
      ...(category && category !== 'all' && { category }),
      ...(sentiment && { sentiment })
    });

    const response = await axios.get(`${API_BASE_URL}/analytics/geo?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching geo data:', error);
    return [];
  }
};
