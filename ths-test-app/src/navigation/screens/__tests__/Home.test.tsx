import React from "react";
import { render, screen, userEvent } from "@testing-library/react-native";
import HomeScreen from "../Home";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoggedInContext } from "@/navigation/LoggedInContext";

const renderWithContext = (
  component: React.ReactNode,
  isLoggedIn = false,
  toggleIsLoggedIn = jest.fn(),
) => {
  return render(
    <SafeAreaProvider>
      <LoggedInContext.Provider value={{ isLoggedIn, toggleIsLoggedIn }}>
        {component}
      </LoggedInContext.Provider>
    </SafeAreaProvider>,
  );
};

test("renders login button when not logged in", () => {
  renderWithContext(<HomeScreen />, false);

  const loginButton = screen.getByText("Log In");
  expect(loginButton).toBeTruthy();
});

test("renders logout button when logged in", () => {
  renderWithContext(<HomeScreen />, true);

  const logoutButton = screen.getByText("Log Out");
  expect(logoutButton).toBeTruthy();
});

test("calls toggleIsLoggedIn when button is pressed", async () => {
  const toggleIsLoggedIn = jest.fn();
  const user = userEvent.setup();
  renderWithContext(<HomeScreen />, false, toggleIsLoggedIn);

  const loginButton = screen.getByText("Log In");
  await user.press(loginButton);

  expect(toggleIsLoggedIn).toHaveBeenCalled();
});
