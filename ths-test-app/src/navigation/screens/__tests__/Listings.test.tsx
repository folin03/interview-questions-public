import React from "react";
import {
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";
import ListingsScreen from "../Listings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { LoggedInContext } from "@/navigation/LoggedInContext";

// Mock fetch globally
global.fetch = jest.fn();

// Mock Alert.alert
jest.spyOn(Alert, "alert");

const mockListings = [
  {
    id: "385669",
    title: "Mountain sit with two cats",
  },
  {
    id: "338555",
    title: "Beach stay with dog",
  },
  {
    id: "339162",
    title: "City apartment with birds",
  },
];

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

// Mock useNavigation and useFocusEffect hooks
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
    useFocusEffect: jest.fn((callback: any) => {
      // Call the callback immediately
      callback();
    }),
  };
});

const renderListingsScreen = (isLoggedIn = true) => {
  return render(
    <SafeAreaProvider>
      <NavigationContainer>
        <LoggedInContext.Provider
          value={{ isLoggedIn, toggleIsLoggedIn: jest.fn() }}
        >
          <ListingsScreen />
        </LoggedInContext.Provider>
      </NavigationContainer>
    </SafeAreaProvider>,
  );
};

describe("ListingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  test("shows alert and navigates back when user is not logged in", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListings,
    });

    renderListingsScreen(false);

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  test("does not show alert when user is logged in", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListings,
    });

    renderListingsScreen(true);

    await waitFor(() => {
      expect(screen.getByText("Mountain sit with two cats")).toBeTruthy();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  test("navigates to ListingDetailScreen with correct listingId when listing is pressed", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListings,
    });

    const user = userEvent.setup();
    renderListingsScreen(true);

    await waitFor(() => {
      expect(screen.getByText("Mountain sit with two cats")).toBeTruthy();
    });

    const listingButton = screen.getByText("Mountain sit with two cats");
    await user.press(listingButton);

    expect(mockNavigate).toHaveBeenCalledWith("ListingDetailScreen", {
      listingId: "385669",
    });
  });

  test("navigates to correct screen for second listing", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListings,
    });

    const user = userEvent.setup();
    renderListingsScreen(true);

    await waitFor(() => {
      expect(screen.getByText("City apartment with birds")).toBeTruthy();
    });

    const cityListingButton = screen.getByText("City apartment with birds");
    await user.press(cityListingButton);

    expect(mockNavigate).toHaveBeenCalledWith("ListingDetailScreen", {
      listingId: "339162",
    });
  });
});
