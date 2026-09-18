import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { postService } from "@/src/services/postService";
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
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePostScreen() {
  const { session } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async () => {
    if (!session) return;
    if (!title.trim() || !body.trim()) {
      setError("Title and body can't be empty.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const postId = await postService.create({
        author_id: session.user.id,
        title: title.trim(),
        body: body.trim(),
      });
      router.replace(`/(shared)/post/${postId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post.");
    } finally {
      setSubmitting(false);
    }
  };

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
            style={styles.postButton}
            onPress={handlePost}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.postButtonText}>POST TO BULLETIN</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
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
  postButton: {
    backgroundColor: colors.teal,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  postButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
