import EmptyState from "@/src/components/EmptyState";
import OrderStatusBadge from "@/src/components/OrderStatusBadge";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { orderService, type OrderWithItems } from "@/src/services/orderService";
import { colors } from "@/src/theme/colors";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderHistoryScreen() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      setOrders(await orderService.getStudentOrders(session.user.id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader title="Order History" />

      {loading && orders.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.teal} />
      ) : error ? (
        <EmptyState
          title="Couldn't load orders"
          subtitle={error}
          onRetry={load}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.order_id}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={
            <EmptyState
              title="No orders yet"
              subtitle="Items you order will show up here."
            />
          }
          renderItem={({ item: order }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                <OrderStatusBadge status={order.status} />
              </View>

              {order.order_item.map((line, i) => (
                <View key={i} style={styles.lineRow}>
                  {line.item?.image_url ? (
                    <Image
                      source={{ uri: line.item.image_url }}
                      style={styles.thumb}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.thumbPlaceholder} />
                  )}
                  <Text style={styles.lineName} numberOfLines={1}>
                    {line.quantity}×{" "}
                    {line.item?.item_name ?? "Item no longer available"}
                  </Text>
                  <Text style={styles.linePrice}>
                    R{(line.price_at_purchase * line.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.cardFooter}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>
                  R{order.total_price.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: {
    backgroundColor: colors.teal,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: "700" },
  list: { padding: 16, gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderDate: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  thumb: { width: 36, height: 36, borderRadius: 6 },
  thumbPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: colors.cardBg,
  },
  lineName: { flex: 1, fontSize: 13, color: colors.dark },
  linePrice: { fontSize: 13, fontWeight: "600", color: colors.dark },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 13, color: colors.muted },
  totalPrice: { fontSize: 15, fontWeight: "700", color: colors.teal },
});
