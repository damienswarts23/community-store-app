import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { useCart } from "@/src/hooks/useCart";
import { orderService, type PaymentMethod } from "@/src/services/orderService";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SHIPPING_FLAT_RATE = 5.0;

type Step = 1 | 2 | 3;

export default function CheckoutScreen() {
  const { lines, total, clear } = useCart();
  const { session } = useAuth();

  const [expandedStep, setExpandedStep] = useState<Step>(2);
  const [deliveryDone, setDeliveryDone] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = lines.length > 0 ? SHIPPING_FLAT_RATE : 0;
  const grandTotal = total + shipping;

  const handleSaveDelivery = () => {
    if (!name.trim() || !address.trim() || !city.trim() || !zip.trim()) {
      setError("Fill in all delivery fields.");
      return;
    }
    setError(null);
    setDeliveryDone(true);
    setExpandedStep(3);
  };

  const canPlaceOrder =
    deliveryDone && paymentMethod !== null && lines.length > 0;

  const handlePlaceOrder = async () => {
    if (!session || !canPlaceOrder || !paymentMethod) return;
    setPlacing(true);
    setError(null);
    try {
      await orderService.placeOrder(
        session.user.id,
        lines,
        grandTotal,
        {
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          zip: zip.trim(),
        },
        paymentMethod,
      );
      clear();
      router.replace("/(student)/orders");
    } catch (e: any) {
      setError(
        e?.message ??
          (e instanceof Error ? e.message : "Failed to place order."),
      );
    } finally {
      setPlacing(false);
    }
  };

  const toggleStep = (step: Step) => {
    setExpandedStep((current) => (current === step ? (0 as Step) : step));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title="Checkout"
        left={
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        }
        right={
          <Ionicons name="lock-closed-outline" size={18} color={colors.white} />
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 1 — Order Summary */}
          <View style={styles.stepCard}>
            <Pressable style={styles.stepHeader} onPress={() => toggleStep(1)}>
              <Ionicons name="basket-outline" size={20} color={colors.teal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepLabel}>STEP 1</Text>
                <Text style={styles.stepTitle}>Order Summary</Text>
              </View>
              <Ionicons
                name={expandedStep === 1 ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.dark}
              />
            </Pressable>
            {expandedStep === 1 && (
              <View style={styles.stepBody}>
                {lines.map((l) => (
                  <View key={l.item_id} style={styles.summaryLine}>
                    <Text style={styles.summaryLineText} numberOfLines={1}>
                      {l.quantity}× {l.item_name}
                    </Text>
                    <Text style={styles.summaryLinePrice}>
                      R{(l.price * l.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLineText}>Subtotal</Text>
                  <Text style={styles.summaryLinePrice}>
                    R{total.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLineText}>Shipping</Text>
                  <Text style={styles.summaryLinePrice}>
                    R{shipping.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Step 2 — Delivery Details */}
          <View style={styles.stepCard}>
            <Pressable style={styles.stepHeader} onPress={() => toggleStep(2)}>
              <Ionicons name="car-outline" size={20} color={colors.teal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepLabel}>STEP 2</Text>
                <Text style={styles.stepTitle}>Delivery Details</Text>
              </View>
              {deliveryDone && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.teal}
                />
              )}
              <Ionicons
                name={expandedStep === 2 ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.dark}
              />
            </Pressable>
            {expandedStep === 2 && (
              <View style={styles.stepBody}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Jane Smith"
                  placeholderTextColor={colors.muted}
                />

                <Text style={styles.fieldLabel}>STREET ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="123 Community Way"
                  placeholderTextColor={colors.muted}
                />

                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>CITY</Text>
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>ZIP CODE</Text>
                    <TextInput
                      style={styles.input}
                      value={zip}
                      onChangeText={setZip}
                      placeholder="10101"
                      placeholderTextColor={colors.muted}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <Pressable
                  style={styles.saveButton}
                  onPress={handleSaveDelivery}
                >
                  <Text style={styles.saveButtonText}>SAVE & CONTINUE</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={colors.white}
                  />
                </Pressable>
              </View>
            )}
          </View>

          {/* Step 3 — Payment Method */}
          <View style={styles.stepCard}>
            <Pressable style={styles.stepHeader} onPress={() => toggleStep(3)}>
              <Ionicons name="card-outline" size={20} color={colors.teal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepLabel}>STEP 3</Text>
                <Text style={styles.stepTitle}>Payment Method</Text>
              </View>
              <Ionicons
                name={expandedStep === 3 ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.dark}
              />
            </Pressable>
            {expandedStep === 3 && (
              <View style={styles.stepBody}>
                <PaymentOption
                  label="Pay on Collection"
                  icon="cash-outline"
                  selected={paymentMethod === "collection"}
                  onPress={() => setPaymentMethod("collection")}
                />
                <PaymentOption
                  label="Card"
                  icon="card-outline"
                  selected={paymentMethod === "card"}
                  onPress={() => setPaymentMethod("card")}
                />
              </View>
            )}
          </View>

          <View style={styles.secureNotice}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.teal}
            />
            <Text style={styles.secureNoticeText}>
              SECURE CHECKOUT{"\n"}Your information is protected with
              industry-standard 256-bit SSL encryption.
            </Text>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomBar}>
        <Pressable
          style={[
            styles.placeButton,
            !canPlaceOrder && styles.placeButtonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={!canPlaceOrder || placing}
        >
          {placing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.placeButtonText}>PLACE ORDER</Text>
              <Text style={styles.placeButtonPrice}>
                R{grandTotal.toFixed(2)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PaymentOption({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={18}
        color={selected ? colors.teal : colors.muted}
      />
      <Text
        style={[
          styles.paymentOptionText,
          selected && styles.paymentOptionTextSelected,
        ]}
      >
        {label}
      </Text>
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={18}
        color={selected ? colors.teal : colors.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: {
    backgroundColor: colors.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: colors.white, fontSize: 16, fontWeight: "700" },
  content: { padding: 16, gap: 16 },
  stepCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.dark,
    marginTop: 2,
  },
  stepBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLineText: {
    flex: 1,
    fontSize: 13,
    color: colors.body,
    marginRight: 8,
  },
  summaryLinePrice: { fontSize: 13, fontWeight: "600", color: colors.dark },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.dark,
  },
  rowFields: { flexDirection: "row", gap: 12 },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.teal,
    borderRadius: 6,
    paddingVertical: 14,
    marginTop: 18,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.tealLight,
  },
  paymentOptionText: { flex: 1, fontSize: 14, color: colors.dark },
  paymentOptionTextSelected: { fontWeight: "700" },
  secureNotice: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    padding: 14,
  },
  secureNoticeText: {
    flex: 1,
    fontSize: 11,
    color: colors.body,
    lineHeight: 16,
  },
  errorText: { color: colors.danger, fontSize: 13, textAlign: "center" },
  bottomBar: { borderTopWidth: 1, borderTopColor: colors.border, padding: 16 },
  placeButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.teal,
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  placeButtonDisabled: { backgroundColor: colors.muted },
  placeButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  placeButtonPrice: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
