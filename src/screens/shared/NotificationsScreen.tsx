import EmptyState from "@/src/components/EmptyState";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { useNotifications } from "@/src/hooks/useNotifications";
import { colors } from "@/src/theme/colors";
import { formatRelativeTime } from "@/src/utils/formatRelativeTime";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const { session } = useAuth();
  const {
    notifications,
    loading,
    error,
    unreadCount,
    refetch,
    markRead,
    markAllRead,
  } = useNotifications(session?.user?.id);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title="Notifications"
        left={
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        }
        right={
          unreadCount > 0 ? (
            <Pressable onPress={markAllRead}>
              <Text style={styles.markAllText}>MARK ALL READ</Text>
            </Pressable>
          ) : (
            <View style={{ width: 22 }} />
          )
        }
      />

      {loading && notifications.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.teal} />
      ) : error ? (
        <EmptyState
          title="Couldn't load notifications"
          subtitle={error}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.notification_id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={loading}
          ListEmptyComponent={
            <EmptyState
              title="You're all caught up"
              subtitle="No notifications yet."
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, !item.read && styles.rowUnread]}
              onPress={() => !item.read && markRead(item.notification_id)}
            >
              {!item.read && <View style={styles.unreadDot} />}
              <View style={styles.rowBody}>
                <Text
                  style={[styles.message, !item.read && styles.messageUnread]}
                >
                  {item.message}
                </Text>
                <Text style={styles.time}>
                  {formatRelativeTime(item.created_at)}
                </Text>
              </View>
            </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: colors.white, fontSize: 16, fontWeight: "700" },
  markAllText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
  },
  rowUnread: { backgroundColor: colors.tealLight, borderColor: colors.teal },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.teal,
    marginTop: 4,
  },
  rowBody: { flex: 1, gap: 4 },
  message: { fontSize: 13, color: colors.dark },
  messageUnread: { fontWeight: "700" },
  time: { fontSize: 11, color: colors.muted },
});
