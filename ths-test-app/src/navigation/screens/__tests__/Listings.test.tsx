import React from "react";
import {
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import ListingsScreen from "../Listings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

// Mock fetch globally
global.fetch = jest.fn();

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

// Mock useNavigation hook
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

const renderListingsScreen = () => {
  return render(
    <SafeAreaProvider>
      <NavigationContainer>
        <ListingsScreen />
      </NavigationContainer>
    </SafeAreaProvider>,
  );
};

describe("ListingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockNavigate.mockClear();
  });

  test("navigates to ListingDetailScreen with correct listingId when listing is pressed", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockListings,
    });

    const user = userEvent.setup();
    renderListingsScreen();

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
    renderListingsScreen();

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
