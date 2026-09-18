import EmptyState from "@/src/components/EmptyState";
import OrderStatusBadge from "@/src/components/OrderStatusBadge";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import {
  orderService,
  type VendorOrderLine,
} from "@/src/services/orderService";
import { colors } from "@/src/theme/colors";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Status = VendorOrderLine["status"];
const STATUS_FLOW: Status[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

function nextStatus(current: Status): Status | null {
  const i = STATUS_FLOW.indexOf(current);
  if (i === -1 || i === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

type GroupedOrder = {
  order_id: string;
  status: Status;
  created_at: string;
  lines: { item_name: string; quantity: number; price_at_purchase: number }[];
  total: number;
};

export default function IncomingOrdersScreen() {
  const { session } = useAuth();
  const [rawLines, setRawLines] = useState<VendorOrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      setRawLines(await orderService.getVendorOrderLines(session.user.id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const orders = useMemo<GroupedOrder[]>(() => {
    const map = new Map<string, GroupedOrder>();
    for (const line of rawLines) {
      const existing = map.get(line.order_id);
      const lineEntry = {
        item_name: line.item_name,
        quantity: line.quantity,
        price_at_purchase: line.price_at_purchase,
      };
      if (existing) {
        existing.lines.push(lineEntry);
        existing.total += line.quantity * line.price_at_purchase;
      } else {
        map.set(line.order_id, {
          order_id: line.order_id,
          status: line.status,
          created_at: line.created_at,
          lines: [lineEntry],
          total: line.quantity * line.price_at_purchase,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [rawLines]);

  const handleAdvance = async (order: GroupedOrder) => {
    const next = nextStatus(order.status);
    if (!next) return;
    setUpdatingId(order.order_id);
    try {
      await orderService.updateStatus(order.order_id, next);
      setRawLines((prev) =>
        prev.map((l) =>
          l.order_id === order.order_id ? { ...l, status: next } : l,
        ),
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader title="Incoming Orders" />
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
              subtitle="Orders for your items will show up here."
            />
          }
          renderItem={({ item: order }) => {
            const next = nextStatus(order.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>
                    #{order.order_id.slice(0, 8)}
                  </Text>
                  <OrderStatusBadge status={order.status} />
                </View>

                {order.lines.map((line, i) => (
                  <Text key={i} style={styles.lineText} numberOfLines={1}>
                    {line.quantity}× {line.item_name} — R
                    {(line.quantity * line.price_at_purchase).toFixed(2)}
                  </Text>
                ))}

                <View style={styles.cardFooter}>
                  <Text style={styles.totalText}>
                    Total: R{order.total.toFixed(2)}
                  </Text>
                  {next && (
                    <Pressable
                      style={styles.advanceButton}
                      onPress={() => handleAdvance(order)}
                      disabled={updatingId === order.order_id}
                    >
                      <Text style={styles.advanceButtonText}>
                        {updatingId === order.order_id
                          ? "..."
                          : `MARK ${next.toUpperCase()}`}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
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
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderId: { fontSize: 13, fontWeight: "700", color: colors.dark },
  lineText: { fontSize: 12, color: colors.body },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 10,
  },
  totalText: { fontSize: 13, fontWeight: "700", color: colors.teal },
  advanceButton: {
    backgroundColor: colors.teal,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  advanceButtonText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
