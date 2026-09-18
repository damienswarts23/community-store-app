import EmptyState from "@/src/components/EmptyState";
import RatingStars from "@/src/components/RatingStars";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import {
  reviewService,
  type ReviewWithStudent,
} from "@/src/services/reviewService";
import { colors } from "@/src/theme/colors";
import { formatRelativeTime } from "@/src/utils/formatRelativeTime";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewListScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { session, role } = useAuth();

  const [reviews, setReviews] = useState<ReviewWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reviewService.getForItem(itemId);
      setReviews(data);
      if (session?.user?.id && role === "student") {
        setAlreadyReviewed(
          await reviewService.hasReviewed(session.user.id, itemId),
        );
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [itemId, session?.user?.id, role]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    if (!session || !itemId || rating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await reviewService.create({
        student_id: session.user.id,
        item_id: itemId,
        rating,
        comment: comment.trim() || null,
      });
      setRating(0);
      setComment("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const canReview = role === "student" && !alreadyReviewed;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title="Reviews"
        left={
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        }
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.teal} />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(r) => r.review_id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            canReview ? (
              <View style={styles.formCard}>
                <Text style={styles.formLabel}>YOUR RATING</Text>
                <RatingStars rating={rating} size={26} onRate={setRating} />

                <Text style={[styles.formLabel, { marginTop: 14 }]}>
                  COMMENT (OPTIONAL)
                </Text>
                <TextInput
                  style={styles.input}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Share your experience..."
                  placeholderTextColor={colors.muted}
                  multiline
                  textAlignVertical="top"
                />

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Pressable
                  style={[
                    styles.submitButton,
                    rating === 0 && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={rating === 0 || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.submitButtonText}>SUBMIT REVIEW</Text>
                  )}
                </Pressable>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              title="No reviews yet"
              subtitle="Be the first to leave one."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>
                  {item.student?.first_name ?? "Anonymous"}{" "}
                  {item.student?.last_name ?? ""}
                </Text>
                <RatingStars rating={item.rating} size={13} />
              </View>
              {item.comment && (
                <Text style={styles.reviewComment}>{item.comment}</Text>
              )}
              <Text style={styles.reviewDate}>
                {formatRelativeTime(item.created_at)}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  list: { padding: 16, gap: 12 },
  formCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 13,
    color: colors.dark,
    minHeight: 70,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: colors.teal,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
  },
  submitButtonDisabled: { backgroundColor: colors.muted },
  submitButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: { fontSize: 13, fontWeight: "700", color: colors.dark },
  reviewComment: { fontSize: 13, color: colors.body, lineHeight: 18 },
  reviewDate: { fontSize: 11, color: colors.muted },
});
