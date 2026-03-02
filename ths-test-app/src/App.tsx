import "react-native-gesture-handler";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StackActions,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { useLogger } from "@react-navigation/devtools";

import { Navigation, RootStackParamList } from "./navigation";
import { LoggedInContext } from "./navigation/LoggedInContext";
import type { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

SplashScreen.preventAutoHideAsync();

export function App() {
  const [serverStarted, setServerStarted] = useState(false);
  const [isLoggedInRetrieved, setIsLoggedInRetrieved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigationRef = useNavigationContainerRef();

  useLogger(navigationRef);

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ["ths-test-app://", "https://ths-test-app.com"],
    subscribe: (listener) => {
      const onReceiveURL = ({ url }: { url: string }) => {
        const parsed = new URL(url);
        const listingId = parsed.searchParams.get("listingId");

        if (!listingId || !navigationRef.isReady()) return;

        const currentRoute = navigationRef.getCurrentRoute();

        // TODO: here we may want to check if the current route is already the listing detail screen for the same listingId,
        // and if so do nothing

        if (currentRoute?.name === "ListingDetailScreen") {
          // Already focused - push new
          navigationRef.dispatch(
            StackActions.push("ListingDetailScreen", {
              listingId: listingId,
            }),
          );
        } else {
          // Normal navigation
          listener(url);
        }
      };

      const subscription = Linking.addEventListener("url", onReceiveURL);

      return () => subscription.remove();
    },
  };

  useEffect(() => {
    async function enableMocking() {
      if (!__DEV__) {
        return;
      }
      await import("../msw.polyfills");
      const { server } = await import("./mocks/server");
      server.listen({
        onUnhandledRequest: "bypass", // bypad internal react-native requests - it spams log console
      });
      setServerStarted(true);
      SplashScreen.hide();
    }
    enableMocking();
  }, []);

  useEffect(() => {
    async function retrieveLoginStatus() {
      let storedStatus = null;
      try {
        storedStatus = await AsyncStorage.getItem("isLoggedIn");
      } catch (e) {
        console.error("Failed to retrieve login status:", e);
      }
      if (storedStatus !== null) {
        setIsLoggedIn(storedStatus === "true");
      } else {
        try {
          await AsyncStorage.setItem("isLoggedIn", false.toString());
        } catch (e) {
          console.error("Failed to save login status:", e);
        }
      }
      setIsLoggedInRetrieved(true);
    }
    retrieveLoginStatus();
  }, []);

  const toggleIsLoggedIn = async () => {
    try {
      const newValue = !isLoggedIn;
      await AsyncStorage.setItem("isLoggedIn", newValue.toString());
      setIsLoggedIn(newValue);
    } catch (e) {
      console.error("Failed to save login status:", e);
    }
  };

  if (!serverStarted || !isLoggedInRetrieved) {
    return null;
  }

  return (
    <LoggedInContext.Provider value={{ isLoggedIn, toggleIsLoggedIn }}>
      <Navigation ref={navigationRef} linking={linking} />
    </LoggedInContext.Provider>
  );
}
