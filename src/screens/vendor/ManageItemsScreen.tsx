import EmptyState from "@/src/components/EmptyState";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { itemService, type ItemWithRating } from "@/src/services/itemService";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageItemsScreen() {
  const { session } = useAuth();

  const [items, setItems] = useState<ItemWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(
    async (refresh = false) => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const data = await itemService.getByVendor(session.user.id);

        setItems(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load your items.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session?.user?.id],
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = (item: ItemWithRating) => {
    Alert.alert(
      "Delete item",
      `Are you sure you want to delete "${item.item_name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await itemService.remove(item.item_id);

              setItems((current) =>
                current.filter((existing) => existing.item_id !== item.item_id),
              );
            } catch (e: any) {
              Alert.alert(
                "Delete failed",
                e?.message ?? "Unable to delete item.",
              );
            }
          },
        },
      ],
    );
  };

  const toggleAvailability = async (item: ItemWithRating) => {
    try {
      await itemService.update(item.item_id, {
        available: !item.available,
      });

      setItems((current) =>
        current.map((existing) =>
          existing.item_id === item.item_id
            ? {
                ...existing,
                available: !existing.available,
              }
            : existing,
        ),
      );
    } catch (e: any) {
      Alert.alert(
        "Update failed",
        e?.message ?? "Unable to update availability.",
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Items</Text>
        </View>

        <View style={styles.loading}>
          <ActivityIndicator color={colors.teal} />
          <Text style={styles.loadingText}>Loading your items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title="Manage Items"
        left={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadItems(true)}
            tintColor={colors.teal}
          />
        }
      >
        {error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.danger}
            />

            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.headingRow}>
          <View>
            <Text style={styles.title}>Your Items</Text>

            <Text style={styles.subtitle}>
              {items.length} {items.length === 1 ? "item" : "items"} listed
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/(vendor)/items/new")}
          >
            <Ionicons name="add" size={17} color={colors.white} />

            <Text style={styles.addButtonText}>ADD ITEM</Text>
          </Pressable>
        </View>

        {items.length === 0 ? (
          <EmptyState
            title="No items yet"
            subtitle="Add your first product to start selling."
            onRetry={() => router.push("/(vendor)/items/new")}
          />
        ) : (
          items.map((item) => (
            <View key={item.item_id} style={styles.itemCard}>
              <View style={styles.itemTop}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={colors.muted}
                    />
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.item_name}
                  </Text>

                  {item.category && (
                    <Text style={styles.category}>{item.category}</Text>
                  )}

                  <Text style={styles.price}>
                    R{Number(item.price).toFixed(2)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.availabilityBadge,
                    item.available ? styles.available : styles.unavailable,
                  ]}
                >
                  <Text
                    style={[
                      styles.availabilityText,
                      item.available
                        ? styles.availableText
                        : styles.unavailableText,
                    ]}
                  >
                    {item.available ? "AVAILABLE" : "UNAVAILABLE"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.itemActions}>
                <View style={styles.availabilityControl}>
                  <Text style={styles.controlLabel}>Available for sale</Text>

                  <Switch
                    value={item.available}
                    onValueChange={() => toggleAvailability(item)}
                    trackColor={{
                      false: colors.border,
                      true: colors.teal,
                    }}
                    thumbColor={colors.white}
                  />
                </View>

                <View style={styles.buttons}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() =>
                      router.push(`/(vendor)/items/${item.item_id}`)
                    }
                  >
                    <Ionicons
                      name="create-outline"
                      size={17}
                      color={colors.teal}
                    />

                    <Text style={styles.editText}>EDIT</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color={colors.danger}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },

  header: {
    backgroundColor: colors.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.dark,
  },

  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.teal,
    borderRadius: 6,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  addButtonText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },

  itemCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    backgroundColor: colors.white,
  },

  itemTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 7,
    marginRight: 12,
  },

  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 7,
    backgroundColor: colors.cardBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.dark,
  },

  category: {
    fontSize: 10,
    color: colors.muted,
    textTransform: "capitalize",
    marginTop: 4,
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.teal,
    marginTop: 7,
  },

  availabilityBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  available: {
    backgroundColor: "#E7F5EC",
  },

  unavailable: {
    backgroundColor: "#FDEAEA",
  },

  availabilityText: {
    fontSize: 8,
    fontWeight: "700",
  },

  availableText: {
    color: "#287A45",
  },

  unavailableText: {
    color: colors.danger,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  availabilityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
  },

  controlLabel: {
    fontSize: 10,
    color: colors.muted,
  },

  buttons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.teal,
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  editText: {
    color: colors.teal,
    fontSize: 9,
    fontWeight: "700",
  },

  deleteButton: {
    width: 34,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E6B9B4",
    borderRadius: 5,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FDEAEA",
    borderWidth: 1,
    borderColor: "#E6B9B4",
    borderRadius: 6,
    padding: 11,
    marginBottom: 12,
  },

  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 12,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  loadingText: {
    color: colors.muted,
    fontSize: 12,
  },
});
