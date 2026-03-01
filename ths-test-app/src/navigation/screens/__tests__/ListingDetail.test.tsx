import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ListingDetailScreen from '../ListingDetail';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock fetch globally
global.fetch = jest.fn();

const mockListing = {
  id: '385669',
  title: 'Mountain sit with two cats',
  location: {
    name: 'Boston',
    admin1Name: 'Massachusetts',
    countryName: 'United States',
  },
  user: {
    firstName: 'John Doe',
  },
  animals: [
    { name: 'dog', count: 3 },
    { name: 'cat', count: 2 },
  ],
  published: '2025-09-30T13:16:03',
};

const mockRoute = {
  params: {
    listingId: '385669',
  },
};

const renderListingDetailScreen = (route = mockRoute) => {
  return render(
    <SafeAreaProvider>
      <ListingDetailScreen route={route} />
    </SafeAreaProvider>
  );
};

describe('ListingDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('renders loading indicator while fetching', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    renderListingDetailScreen();

    const loadingIndicator = screen.getByTestId('activity-indicator');
    expect(loadingIndicator).toBeTruthy();
  });

  test('displays listing details on successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListing,
    });

    renderListingDetailScreen();

    await waitFor(() => {
      expect(screen.getByText(mockListing.title)).toBeTruthy();
    });

    expect(screen.getByText('Mountain sit with two cats')).toBeTruthy();
    expect(screen.getByText(/Boston/)).toBeTruthy();
    expect(screen.getByText(/Massachusetts/)).toBeTruthy();
    expect(screen.getByText(/United States/)).toBeTruthy();
    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  test('displays all animal information', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListing,
    });

    renderListingDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('dog (3)')).toBeTruthy();
      expect(screen.getByText('cat (2)')).toBeTruthy();
    });
  });

  test('shows error message when listing not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => null,
    });

    renderListingDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Listing not found')).toBeTruthy();
    });
  });

  test('fetches listing with correct URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListing,
    });

    renderListingDetailScreen();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/listings/385669');
    });
  });

  test('renders all section labels', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListing,
    });

    renderListingDetailScreen();

    await waitFor(() => {
      expect(screen.getByText('Location')).toBeTruthy();
      expect(screen.getByText('Host')).toBeTruthy();
      expect(screen.getByText('Animals')).toBeTruthy();
      expect(screen.getByText('Published')).toBeTruthy();
    });
  });
});
