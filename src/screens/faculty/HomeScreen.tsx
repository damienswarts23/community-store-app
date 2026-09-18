import EmptyState from "@/src/components/EmptyState";
import PostCard from "@/src/components/PostCard";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { postService, type PostWithAuthor } from "@/src/services/postService";
import { colors } from "@/src/theme/colors";
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

export default function HomeScreen() {
  const { session } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      setPosts(await postService.getByAuthor(session.user.id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load your posts.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader title="Faculty Home" />

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.actionCard}
          onPress={() => router.push("/(faculty)/post/new")}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.teal} />
          <Text style={styles.actionLabel}>New Post</Text>
        </Pressable>
        <Pressable
          style={styles.actionCard}
          onPress={() => router.push("/(shared)/bulletin")}
        >
          <Ionicons name="clipboard-outline" size={22} color={colors.teal} />
          <Text style={styles.actionLabel}>Bulletin Board</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Your Posts</Text>

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
              title="You haven't posted yet"
              subtitle="Tap 'New Post' to share an announcement."
            />
          }
          renderItem={({ item }) => (
            <PostCard
              title={item.title}
              body={item.body}
              authorFirstName={item.author_first_name}
              authorLastName={item.author_last_name}
              createdAt={item.created_at}
              onPress={() => router.push(`/(shared)/post/${item.post_id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  actionsRow: { flexDirection: "row", gap: 12, padding: 16 },
  actionCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 16,
  },
  actionLabel: { fontSize: 12, fontWeight: "600", color: colors.dark },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  list: { padding: 16, paddingTop: 8, gap: 12 },
});
