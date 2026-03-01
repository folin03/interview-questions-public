import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createStaticNavigation,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";

import HomeScreen from "./screens/Home";
import Listings from "./screens/Listings";
import NotFound from "./screens/NotFound";

import { HapticTab } from "../components/HapticTab";
import { IconSymbol } from "../components/ui/IconSymbol";
import TabBarBackground from "../components/ui/TabBarBackground";
import ListingDetailScreen from "./screens/ListingDetail";

export type HomeTabsParamList = {
  HomeScreen: undefined;
  Listings: undefined;
};

const HomeTabs = createBottomTabNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        headerShown: false,
        tabBarIcon: ({ color }) => (
          <IconSymbol size={28} name="house.fill" color={color} />
        ),
      },
    },
    Listings: {
      screen: Listings,
      options: {
        headerShown: false,
        tabBarIcon: ({ color }) => (
          <IconSymbol size={28} name="pawprint" color={color} />
        ),
      },
    },
  },
  screenOptions: {
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarBackground: TabBarBackground,
    tabBarStyle: Platform.select({
      ios: {
        // Use a transparent background on iOS to show the blur effect
        position: "absolute" as const,
      },
      default: {},
    }),
  },
});

export type RootStackParamList = {
  HomeTabs: NavigatorScreenParams<HomeTabsParamList> | undefined;
  NotFound: undefined;
  ListingDetailScreen: { listingId: string };
};

const RootStack = createNativeStackNavigator({
  screens: {
    HomeTabs: {
      screen: HomeTabs,
      options: {
        headerShown: false,
      },
    },
    NotFound: {
      screen: NotFound,
      options: {
        title: "404",
      },
      linking: {
        path: "*",
      },
    },
    ListingDetailScreen: {
      screen: ListingDetailScreen,
      params: {
        listingId: "" as string,
      },
      options: { title: "Listing Details" },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
