import EmptyState from "@/src/components/EmptyState";
import ScreenHeader from "@/src/components/ScreenHeader";
import { postService } from "@/src/services/postService";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const post = await postService.getById(id);
        if (cancelled) return;
        if (!post) {
          setError("Post not found.");
          return;
        }
        setTitle(post.title);
        setBody(post.body);
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

  const handleSave = async () => {
    if (!id) return;
    if (!title.trim() || !body.trim()) {
      setError("Title and body can't be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await postService.update(id, { title: title.trim(), body: body.trim() });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert("Delete post?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await postService.remove(id);
            router.replace("/(shared)/bulletin");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.teal} />
      </SafeAreaView>
    );
  }

  if (error && !title) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState title="Couldn't load post" subtitle={error} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title="New Post"
        left={
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
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
          <Text style={styles.label}>TITLE</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Post title"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>BODY</Text>
          <TextInput
            style={styles.bodyInput}
            value={body}
            onChangeText={setBody}
            placeholder="Write your announcement..."
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 20,
  },
  bodyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 14,
    fontSize: 14,
    color: colors.dark,
    minHeight: 180,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: colors.teal,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
