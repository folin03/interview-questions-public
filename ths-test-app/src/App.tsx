import 'react-native-gesture-handler';
import { useEffect, useState, createContext } from "react";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useNavigationContainerRef,
} from '@react-navigation/native';
import { useLogger } from '@react-navigation/devtools';

import { Navigation } from './navigation';

SplashScreen.preventAutoHideAsync();

const LoggedInContext = createContext<LoggedInContextType>({isLoggedIn: false, toggleIsLoggedIn: async () => {}});

export interface LoggedInContextType {
  isLoggedIn: boolean;
  toggleIsLoggedIn: () => Promise<void>;
}

export function App() {
  const [ serverStarted, setServerStarted ] = useState(false);
  const [ isLoggedInRetrieved, setIsLoggedInRetrieved ] = useState(false);
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);

  const navigationRef = useNavigationContainerRef();

  useLogger(navigationRef);

  useEffect(() => {
      async function enableMocking() {
        if (!__DEV__) {
          return
        }
        await import('../msw.polyfills');
        const { server } = await import('./mocks/server');
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
          storedStatus = await AsyncStorage.getItem('isLoggedIn');
        } catch (e) {
          console.error("Failed to retrieve login status:", e);
        }
        if (storedStatus !== null) {
          setIsLoggedIn(storedStatus === 'true');
        } else {
          try {
            await AsyncStorage.setItem('isLoggedIn', false.toString());
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
      await AsyncStorage.setItem('isLoggedIn', newValue.toString());
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
      <Navigation ref={navigationRef} />
    </LoggedInContext.Provider>
  );
}

export { LoggedInContext };
