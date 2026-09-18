import EmptyState from "@/src/components/EmptyState";
import OrderStatusBadge from "@/src/components/OrderStatusBadge";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { itemService } from "@/src/services/itemService";
import {
  orderService,
  type VendorOrderLine,
} from "@/src/services/orderService";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { session } = useAuth();
  const [itemCount, setItemCount] = useState(0);
  const [orderLines, setOrderLines] = useState<VendorOrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [items, lines] = await Promise.all([
        itemService.getByVendor(session.user.id),
        orderService.getVendorOrderLines(session.user.id),
      ]);
      setItemCount(items.length);
      setOrderLines(lines);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const { pendingCount, totalRevenue, recentOrders } = useMemo(() => {
    const byOrder = new Map<
      string,
      { status: VendorOrderLine["status"]; created_at: string; total: number }
    >();
    for (const line of orderLines) {
      const existing = byOrder.get(line.order_id);
      const lineTotal = line.quantity * line.price_at_purchase;
      if (existing) {
        existing.total += lineTotal;
      } else {
        byOrder.set(line.order_id, {
          status: line.status,
          created_at: line.created_at,
          total: lineTotal,
        });
      }
    }
    const orders = Array.from(byOrder.entries()).map(([order_id, v]) => ({
      order_id,
      ...v,
    }));
    orders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return {
      pendingCount: orders.filter((o) => o.status === "pending").length,
      totalRevenue: orderLines.reduce(
        (sum, l) => sum + l.quantity * l.price_at_purchase,
        0,
      ),
      recentOrders: orders.slice(0, 5),
    };
  }, [orderLines]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.teal} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader title="Dashboard" />
      <ScrollView contentContainerStyle={styles.content}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.statsRow}>
          <StatCard
            icon="pricetags-outline"
            label="Items Listed"
            value={String(itemCount)}
          />
          <StatCard
            icon="time-outline"
            label="Pending Orders"
            value={String(pendingCount)}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon="cash-outline"
            label="Total Revenue"
            value={`R${totalRevenue.toFixed(2)}`}
            wide
          />
        </View>

        <View style={styles.actionsRow}>
          <ActionCard
            icon="add-circle-outline"
            label="Add Item"
            onPress={() => router.push("/(vendor)/items")}
          />
          <ActionCard
            icon="list-outline"
            label="Manage Items"
            onPress={() => router.push("/(vendor)/items")}
          />
          <ActionCard
            icon="receipt-outline"
            label="View Orders"
            onPress={() => router.push("/(vendor)/orders")}
          />
        </View>

        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {recentOrders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            subtitle="Orders for your items will show up here."
          />
        ) : (
          recentOrders.map((order) => (
            <View key={order.order_id} style={styles.orderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>
                  #{order.order_id.slice(0, 8)}
                </Text>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
              <Text style={styles.orderTotal}>R{order.total.toFixed(2)}</Text>
              <OrderStatusBadge status={order.status} />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  label,
  value,
  wide,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.statCard, wide && { flex: 1 }]}>
      <Ionicons name={icon} size={20} color={colors.teal} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.teal} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
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
  content: { padding: 16, gap: 12 },
  errorText: { color: colors.danger, fontSize: 13, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: "700", color: colors.dark },
  statLabel: { fontSize: 11, color: colors.muted },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 16,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.dark,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
    marginTop: 8,
    marginBottom: 4,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  orderId: { fontSize: 13, fontWeight: "700", color: colors.dark },
  orderDate: { fontSize: 11, color: colors.muted, marginTop: 2 },
  orderTotal: { fontSize: 13, fontWeight: "700", color: colors.teal },
});
