import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoggedInContext } from "../LoggedInContext";

/**
 *  helper component to display a label and value in a section
 */
const SectionLabelValue = (props: { label: string; value: string }) => (
  <View style={styles.section}>
    <Text style={styles.label}>{props.label}</Text>
    <Text style={styles.value}>{props.value}</Text>
  </View>
);

interface ListingDetail {
  id: string;
  title: string;
  location: {
    name: string;
    admin1Name: string;
    countryName: string;
  };
  user: {
    firstName: string;
  };
  animals: {
    name: string;
    count: number;
  }[];
  published: string;
}

export default function ListingDetailScreen({ route }: any) {
  const { listingId } = route.params;
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useContext(LoggedInContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoggedIn) {
      // not authorised here, navigate them back to login
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeTabs", params: { screen: "HomeScreen" } }],
      });
      Alert.alert(
        "Access Denied",
        "You must be logged in to view listing details.",
      );
    } else {
      fetch(`/api/listings/${listingId}`)
        .then((response) => response.json())
        .then((data) => {
          setListing(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log("Error fetching listing details:", err);
          setLoading(false);
        });
    }
  }, [isLoggedIn, listingId, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {loading ? (
        <ActivityIndicator
          testID="activity-indicator"
          size="large"
          color="#0000ff"
        />
      ) : !listing ? (
        <Text style={styles.error}>Listing not found</Text>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>{listing.title}</Text>
          <SectionLabelValue
            label="Location"
            value={`${listing.location.name}, ${listing.location.admin1Name}, ${listing.location.countryName}`}
          />
          <SectionLabelValue label="Host" value={listing.user.firstName} />
          {listing.animals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Animals</Text>
              {listing.animals.map((animal, index) => (
                <Text key={index} style={styles.value}>
                  {animal.name} ({animal.count})
                </Text>
              ))}
            </View>
          )}
          <SectionLabelValue
            label="Published"
            value={new Date(listing.published).toLocaleDateString()}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  error: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
  },
});
