import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import ListingDetailScreen from "../ListingDetail";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoggedInContext } from "@/navigation/LoggedInContext";

// Mock fetch globally
global.fetch = jest.fn();

// Mock Alert.alert
jest.spyOn(Alert, "alert");

const mockListing = {
  id: "385669",
  title: "Mountain sit with two cats",
  location: {
    name: "Boston",
    admin1Name: "Massachusetts",
    countryName: "United States",
  },
  user: {
    firstName: "John Doe",
  },
  animals: [
    { name: "dog", count: 3 },
    { name: "cat", count: 2 },
  ],
  published: "2025-09-30T13:16:03",
};

const mockRoute = {
  params: {
    listingId: "385669",
  },
};

const mockNavigationReset = jest.fn();

// Mock useNavigation hook
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      reset: mockNavigationReset,
    }),
  };
});

const renderListingDetailScreen = (route = mockRoute, isLoggedIn = true) => {
  return render(
    <SafeAreaProvider>
      <LoggedInContext.Provider
        value={{ isLoggedIn, toggleIsLoggedIn: jest.fn() }}
      >
        <ListingDetailScreen route={route} />
      </LoggedInContext.Provider>
    </SafeAreaProvider>,
  );
};

describe("ListingDetailScreen", () => {
  beforeEach(() => {
    mockNavigationReset.mockReset();
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  test("shows alert and resets navigation when user is not logged in", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListing,
    });

    renderListingDetailScreen(mockRoute, false);

    await waitFor(() => {
      expect(mockNavigationReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "HomeTabs", params: { screen: "HomeScreen" } }],
      });
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  test("does not fetch listing when user is not logged in", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListing,
    });

    renderListingDetailScreen(mockRoute, false);

    expect(global.fetch).not.toHaveBeenCalledWith("/api/listings/385669");
  });

  test("does not show alert when user is logged in", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListing,
    });

    renderListingDetailScreen(mockRoute, true);

    await waitFor(() => {
      expect(screen.getByText("Mountain sit with two cats")).toBeTruthy();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  test("displays listing title when logged in and fetches successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListing,
    });

    renderListingDetailScreen(mockRoute, true);

    await waitFor(() => {
      expect(screen.getByText("Mountain sit with two cats")).toBeTruthy();
    });
  });
});
