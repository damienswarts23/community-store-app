import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { supabase } from "@/src/lib/supabase";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Profile = {
  first_name: string;
  last_name: string;
  fmember_email: string;
  address: string | null;
  phone_number: string | null;
};

export default function FacultyProfileScreen() {
  const { session } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [session?.user?.id]);

  const loadProfile = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("faculty_member")
        .select("first_name, last_name, fmember_email, address, phone_number")
        .eq("fmember_id", session.user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFirstName(data.first_name ?? "");
      setLastName(data.last_name ?? "");
      setPhoneNumber(data.phone_number ?? "");
    } catch (error) {
      console.error("Failed to load faculty profile:", error);
      setFirstName(session.user.user_metadata?.first_name ?? "");
      setLastName(session.user.user_metadata?.last_name ?? "");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!session?.user?.id) return;
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter your first and last name.",
      );
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("faculty_member")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phoneNumber.trim() || null,
        })
        .eq("fmember_id", session.user.id)
        .select("first_name, last_name, fmember_email, address, phone_number")
        .single();

      if (error) throw error;

      setProfile(data);
      setEditing(false);
      Alert.alert("Profile updated", "Your profile has been saved.");
    } catch (error) {
      Alert.alert(
        "Couldn't save profile",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setPhoneNumber(profile.phone_number ?? "");
    }
    setEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const getInitials = () => {
    const first = firstName.trim().charAt(0);
    const last = lastName.trim().charAt(0);
    return `${first}${last}`.toUpperCase() || "F";
  };

  const displayName = `${firstName} ${lastName}`.trim() || "Faculty";

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScreenHeader title="Profile" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.teal} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title="Profile"
        right={
          !editing ? (
            <Pressable onPress={() => setEditing(true)} hitSlop={8}>
              <Ionicons name="create-outline" size={22} color={colors.white} />
            </Pressable>
          ) : (
            <Pressable onPress={handleCancel}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </Pressable>
          )
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="ribbon-outline" size={13} color={colors.teal} />
            <Text style={styles.roleText}>FACULTY</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT INFORMATION</Text>
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>FIRST NAME</Text>
              {editing ? (
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                  placeholderTextColor={colors.muted}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {firstName || "Not provided"}
                </Text>
              )}
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>LAST NAME</Text>
              {editing ? (
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                  placeholderTextColor={colors.muted}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {lastName || "Not provided"}
                </Text>
              )}
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
              <Text style={styles.fieldValue}>
                {profile?.fmember_email ??
                  session?.user?.email ??
                  "Not provided"}
              </Text>
              <Text style={styles.fieldHint}>
                Email is linked to your account.
              </Text>
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              {editing ? (
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  style={styles.input}
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {phoneNumber || "Not provided"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {editing && (
          <Pressable
            style={styles.saveButton}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
            )}
          </Pressable>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <Pressable
              style={styles.actionRow}
              onPress={() => router.push("/(faculty)/home")}
            >
              <View style={styles.actionIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={colors.teal}
                />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Your Posts</Text>
                <Text style={styles.actionSubtitle}>
                  View and manage your bulletin posts
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={19} color="#B42318" />
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </Pressable>

        <Text style={styles.versionText}>Community Store</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  cancelText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  content: { padding: 16, paddingBottom: 40 },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 18,
    marginBottom: 8,
    gap: 6,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#EAF3F5",
    borderWidth: 2,
    borderColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 26, fontWeight: "700", color: colors.teal },
  profileName: { fontSize: 21, fontWeight: "700", color: colors.dark },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF3F5",
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  roleText: {
    color: colors.teal,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  field: { padding: 14 },
  fieldLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  fieldValue: { fontSize: 14, color: colors.dark, fontWeight: "500" },
  fieldHint: { fontSize: 10, color: colors.muted, marginTop: 4 },
  fieldDivider: { height: 1, backgroundColor: colors.border },
  input: {
    fontSize: 14,
    color: colors.dark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  saveButton: {
    backgroundColor: colors.teal,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginTop: 16,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  actionRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAF3F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionContent: { flex: 1 },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 2,
  },
  actionSubtitle: { fontSize: 11, color: colors.muted },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E6B9B4",
    borderRadius: 6,
    paddingVertical: 14,
    marginTop: 24,
  },
  signOutText: {
    color: "#B42318",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  versionText: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 10,
    marginTop: 18,
  },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
});
