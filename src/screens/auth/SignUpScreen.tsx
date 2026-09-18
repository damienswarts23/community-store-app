import ThemedTextInput from "@/src/components/ThemedTextInput";
import type { UserRole } from "@/src/contexts/AuthContext";
import { useAuth } from "@/src/hooks/useAuth";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#0A5C74";

type Role = Exclude<UserRole, null>;

const ROLES: { label: string; value: Role }[] = [
  { label: "Student", value: "student" },
  { label: "Faculty", value: "faculty" },
  { label: "Vendor", value: "vendor" },
];

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    setError(null);

    if (!firstName || !lastName || !email || !password) {
      setError("Fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const { error: signUpError } = await signUp(
      email,
      password,
      role,
      firstName,
      lastName,
    );
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }
    router.replace({ pathname: "/(auth)/verify-email", params: { email } });
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
            <Pressable
              style={styles.tab}
              onPress={() => router.replace("/(auth)/sign-in")}
            >
              <Text style={styles.tabText}>LOGIN</Text>
            </Pressable>
            <View style={styles.tabActive}>
              <Text style={styles.tabActiveText}>SIGN UP</Text>
              <View style={styles.tabIndicator} />
            </View>
          </View>

          <Text style={styles.label}>I AM A</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => {
              const selected = role === r.value;
              return (
                <Pressable
                  key={r.value}
                  onPress={() => setRole(r.value)}
                  style={[styles.rolePill, selected && styles.rolePillSelected]}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      selected && styles.rolePillTextSelected,
                    ]}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.label}>FIRST NAME</Text>
              <ThemedTextInput
                style={styles.inputSpacing}
                placeholder="Jane"
                onChangeText={setFirstName}
                value={firstName}
              />
            </View>
            <View style={styles.nameField}>
              <Text style={styles.label}>LAST NAME</Text>
              <ThemedTextInput
                style={styles.inputSpacing}
                placeholder="Doe"
                onChangeText={setLastName}
                value={lastName}
              />
            </View>
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

          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <ThemedTextInput
            icon="lock-closed-outline"
            style={styles.inputSpacing}
            placeholder="Confirm password"
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            secureTextEntry
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={styles.submitButton}
            onPress={handleSignUp}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>SIGN UP</Text>
            )}
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
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  rolePill: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E1E4E6",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  rolePillSelected: { backgroundColor: TEAL, borderColor: TEAL },
  rolePillText: { fontSize: 13, fontWeight: "600", color: "#5F6368" },
  rolePillTextSelected: { color: "#fff" },
  nameRow: { flexDirection: "row", gap: 12 },
  nameField: { flex: 1 },
  errorText: {
    color: "#C0392B",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 11,
    color: "#9AA0A6",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 16,
  },
});
