import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

interface Listing {
  id: number;
  title: string;
}

interface ListingRowProps {
  listing: Listing;
  onPress?: (listingId: string) => void;
}

const ListingRow = (props: ListingRowProps) => {
  const { listing, onPress } = props;

  const handlePress = () => {
    onPress?.(listing.id.toString());
  };

  return (
    <TouchableOpacity style={styles.item} onPress={handlePress} testID="listing-item">
      <Text style={styles.title}>{listing.title}</Text>
    </TouchableOpacity>
  );
};

export default function ListingsScreen() {
  const [listingData, setListingData] = useState<Listing[]>([]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    fetch("/api/listings")
      .then((response) => response.json())
      .then((data) => setListingData(data));
  }, []);

  const handleListingPress = (listingId: string) => {
    navigation.navigate("ListingDetailScreen", { listingId: listingId });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={listingData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ListingRow listing={item} onPress={handleListingPress} />
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    width: "100%",
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
  },
});
