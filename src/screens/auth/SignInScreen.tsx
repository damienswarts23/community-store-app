import ThemedTextInput from "@/src/components/ThemedTextInput";
import { useAuth } from "@/src/hooks/useAuth";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#0A5C74";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) setError(signInError);
    // on success, session updates -> app/index.tsx redirects by role
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Campus Connect</Text>
          <Text style={styles.subtitle}>
            Your academic marketplace for shared resources and community
            exchange.
          </Text>

          <View style={styles.tabs}>
            <View style={styles.tabActive}>
              <Text style={styles.tabActiveText}>LOGIN</Text>
              <View style={styles.tabIndicator} />
            </View>
            <Pressable
              style={styles.tab}
              onPress={() => router.push("/(auth)/sign-up")}
            >
              <Text style={styles.tabText}>SIGN UP</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>UNIVERSITY EMAIL</Text>
          <ThemedTextInput
            icon="mail-outline"
            style={styles.inputSpacing}
            placeholder="email@mycput.ac.za"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <ThemedTextInput
            icon="lock-closed-outline"
            style={styles.inputSpacing}
            placeholder="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>LOGIN</Text>
            )}
          </Pressable>

          <Link href="/(auth)/sign-in" style={styles.forgotPassword}>
            {/* TODO: point at a real forgot-password route once it exists */}
            <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
          </Link>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.microsoftButton}>
            <Text style={styles.microsoftButtonText}>MICROSOFT</Text>
          </Pressable>

          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Community
            Guidelines.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: TEAL,
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  subtitle: {
    fontSize: 14,
    color: "#5F6368",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },
  tabs: { flexDirection: "row", marginBottom: 24 },
  tabActive: { flex: 1, alignItems: "center", paddingBottom: 10 },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E6",
  },
  tabActiveText: {
    color: TEAL,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  tabText: {
    color: "#9AA0A6",
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  tabIndicator: {
    height: 2,
    backgroundColor: TEAL,
    width: "100%",
    marginTop: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3C4043",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputSpacing: { marginBottom: 20 },
  errorText: {
    color: "#C0392B",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  forgotPassword: { alignSelf: "center", marginTop: 20 },
  forgotPasswordText: { color: TEAL, fontWeight: "600", fontSize: 13 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E1E4E6" },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    color: "#9AA0A6",
    letterSpacing: 0.5,
  },
  microsoftButton: {
    borderWidth: 1,
    borderColor: "#3C4043",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
  },
  microsoftButtonText: { fontWeight: "700", fontSize: 13, letterSpacing: 0.5 },
  footerText: {
    fontSize: 11,
    color: "#9AA0A6",
    textAlign: "center",
    marginTop: 28,
    lineHeight: 16,
  },
});
