import EmptyState from "@/src/components/EmptyState";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { postService, type PostWithAuthor } from "@/src/services/postService";
import { colors } from "@/src/theme/colors";
import { formatRelativeTime } from "@/src/utils/formatRelativeTime";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BulletinBoardScreen() {
  const { role } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPosts(await postService.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader title="Bulletin Board" />

      {loading && posts.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.teal} />
      ) : error ? (
        <EmptyState
          title="Couldn't load posts"
          subtitle={error}
          onRetry={load}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.post_id}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={
            <EmptyState
              title="No posts yet"
              subtitle={
                role === "faculty"
                  ? "Be the first to post something."
                  : "Check back soon."
              }
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/(shared)/post/${item.post_id}`)}
            >
              <View style={styles.pinBar} />
              <View style={styles.cardBody}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.body} numberOfLines={3}>
                  {item.body}
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons
                    name="school-outline"
                    size={13}
                    color={colors.muted}
                  />
                  <Text style={styles.metaText}>
                    {item.author_first_name} {item.author_last_name} ·{" "}
                    {formatRelativeTime(item.created_at)}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {role === "faculty" && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/(faculty)/post/new")}
        >
          <Ionicons name="add" size={26} color={colors.white} />
        </Pressable>
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
    flexDirection: "row",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  pinBar: { width: 4, backgroundColor: colors.teal },
  cardBody: { flex: 1, padding: 14, gap: 6 },
  title: { fontSize: 15, fontWeight: "700", color: colors.dark },
  body: { fontSize: 13, color: colors.body, lineHeight: 19 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  metaText: { fontSize: 11, color: colors.muted },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});
