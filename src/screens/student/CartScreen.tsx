import EmptyState from "@/src/components/EmptyState";
import ScreenHeader from "@/src/components/ScreenHeader";
import type { CartLine } from "@/src/contexts/CartContext";
import { useCart } from "@/src/hooks/useCart";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SHIPPING_FLAT_RATE = 5.0;

export default function CartScreen() {
  const { lines, updateQuantity, removeItem, clear, total } = useCart();

  const shipping = lines.length > 0 ? SHIPPING_FLAT_RATE : 0;
  const grandTotal = total + shipping;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title="Cart"
        right={
          lines.length > 0 && (
            <Pressable onPress={clear} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={colors.white} />
            </Pressable>
          )
        }
      />

      {lines.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          subtitle="Browse the marketplace to find something you need."
        />
      ) : (
        <>
          <FlatList
            data={lines}
            keyExtractor={(l) => l.item_id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <CartLineRow
                line={item}
                onIncrease={() =>
                  updateQuantity(item.item_id, item.quantity + 1)
                }
                onDecrease={() =>
                  updateQuantity(item.item_id, item.quantity - 1)
                }
                onRemove={() => removeItem(item.item_id)}
              />
            )}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>R{total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>R{shipping.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.bottomBar}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalPrice}>R{grandTotal.toFixed(2)}</Text>
            </View>
            <Pressable
              style={styles.checkoutButton}
              onPress={() => router.push("/(student)/checkout")}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.white} />
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function CartLineRow({
  line,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  line: CartLine;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.row}>
      {line.image_url ? (
        <Image
          source={{ uri: line.image_url }}
          style={styles.thumb}
          contentFit="cover"
        />
      ) : (
        <View style={styles.thumbPlaceholder} />
      )}

      <View style={styles.rowInfo}>
        <View style={styles.rowTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName} numberOfLines={1}>
              {line.item_name}
            </Text>
            <Text style={styles.vendorName} numberOfLines={1}>
              {line.vendor_name}
            </Text>
          </View>
          <Text style={styles.itemPrice}>R{line.price.toFixed(2)}</Text>
        </View>

        <View style={styles.rowBottom}>
          <View style={styles.stepperRow}>
            <Pressable style={styles.stepperButton} onPress={onDecrease}>
              <Ionicons name="remove" size={16} color={colors.teal} />
            </Pressable>
            <Text style={styles.quantityText}>{line.quantity}</Text>
            <Pressable style={styles.stepperButton} onPress={onIncrease}>
              <Ionicons name="add" size={16} color={colors.teal} />
            </Pressable>
          </View>

          <Pressable onPress={onRemove} style={styles.removeRow} hitSlop={8}>
            <Ionicons name="trash-outline" size={13} color={colors.danger} />
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: {
    backgroundColor: colors.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: "700" },
  list: { padding: 16, gap: 12 },
  row: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  thumb: { width: 64, height: 64, borderRadius: 6 },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: colors.cardBg,
  },
  rowInfo: { flex: 1, justifyContent: "space-between" },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: { fontSize: 15, fontWeight: "600", color: colors.dark },
  vendorName: { fontSize: 12, color: colors.muted, marginTop: 2 },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.teal,
    marginLeft: 8,
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.cardBg,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepperButton: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.dark,
    minWidth: 14,
    textAlign: "center",
  },
  removeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  removeText: { fontSize: 12, fontWeight: "600", color: colors.danger },
  summary: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 13, color: colors.muted },
  summaryValue: { fontSize: 13, color: colors.dark, fontWeight: "600" },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 14, color: colors.muted },
  totalPrice: { fontSize: 20, fontWeight: "700", color: colors.teal },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.teal,
    borderRadius: 6,
    paddingVertical: 16,
  },
  checkoutButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
