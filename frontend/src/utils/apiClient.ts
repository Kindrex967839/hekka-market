/**
 * API Client for HEKKA MARKET
 * This replaces the Databutton "brain" module with a simpler fetch-based client
 */

// Base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Default request options
const defaultOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Generic API request function
 */
async function request<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  customOptions: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const options: RequestInit = {
    ...defaultOptions,
    ...customOptions,
    method,
    headers: {
      ...defaultOptions.headers,
      ...customOptions.headers,
    },
  };

  // Add body data for non-GET requests
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    // Parse JSON response
    const result = await response.json();
    return result as T;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * API client with methods for different endpoints
 */
const apiClient = {
  // Health check endpoint
  checkHealth: () => request<{ status: string }>('/routes/_healthz'),
  
  // Add more API methods here as needed
  // Example:
  // getProducts: () => request<Product[]>('/routes/products'),
  // getProduct: (id: string) => request<Product>(`/routes/products/${id}`),
  // createProduct: (data: ProductInput) => request<Product>('/routes/products', 'POST', data),
};

export default apiClient;
