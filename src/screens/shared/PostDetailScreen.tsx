import EmptyState from "@/src/components/EmptyState";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { postService, type PostWithAuthor } from "@/src/services/postService";
import { colors } from "@/src/theme/colors";
import { formatRelativeTime } from "@/src/utils/formatRelativeTime";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();

  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const found = await postService.getById(id);
        if (!cancelled) setPost(found);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load post.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isAuthor = post?.author_id === session?.user.id;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.teal} />
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState title="Post not found" subtitle={error ?? undefined} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title="Post"
        left={
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        }
        right={
          isAuthor ? (
            <Pressable
              onPress={() =>
                router.push(`/(faculty)/post/${post.post_id}/edit`)
              }
            >
              <Ionicons name="create-outline" size={20} color={colors.white} />
            </Pressable>
          ) : (
            <View style={{ width: 20 }} />
          )
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{post.title}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="school-outline" size={14} color={colors.muted} />
          <Text style={styles.metaText}>
            {post.author_first_name} {post.author_last_name} ·{" "}
            {formatRelativeTime(post.created_at)}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.body}>{post.body}</Text>
      </ScrollView>
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
  content: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.dark,
    lineHeight: 28,
    marginBottom: 10,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  body: { fontSize: 15, color: colors.body, lineHeight: 23 },
});
