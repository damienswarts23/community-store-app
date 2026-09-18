import { AuthProvider } from "@/src/contexts/AuthContext";
import { CartProvider } from "@/src/contexts/CartContext";
import { colors } from "@/src/theme/colors";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar
          style="dark"
          backgroundColor={colors.teal}
          translucent={false}
        />
        <Slot />
      </CartProvider>
    </AuthProvider>
  );
}
