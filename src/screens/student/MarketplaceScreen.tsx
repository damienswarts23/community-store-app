import EmptyState from "@/src/components/EmptyState";
import ItemCard from "@/src/components/ItemCard";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useItems } from "@/src/hooks/useItems";
import type { ItemCategory } from "@/src/services/itemService";
import { postService, type PostWithAuthor } from "@/src/services/postService";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

const CATEGORIES: {
  label: string;
  value: ItemCategory;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "Books", value: "books", icon: "book-outline" },
  { label: "Electronics", value: "electronics", icon: "laptop-outline" },
  { label: "Household", value: "household", icon: "home-outline" },
  { label: "Fashion", value: "fashion", icon: "shirt-outline" },
  { label: "Leisure", value: "leisure", icon: "bicycle-outline" },
];

export default function MarketplaceScreen() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const { items, loading, error, refetch } = useItems(search, category);

  const [posts, setPosts] = useState<PostWithAuthor[]>([]);

  useEffect(() => {
    postService
      .getRecent(2)
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  const ListHeader = () => (
    <View>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          The digital heart of{"\n"}our neighborhood.
        </Text>
        <Text style={styles.heroBody}>
          Connect with local vendors, stay updated on community events, and find
          what you need.
        </Text>
      </View>

      {/* Bulletin preview */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Bulletin Board</Text>
          <Pressable onPress={() => router.push("/(shared)/bulletin")}>
            <Text style={styles.sectionLink}>OPEN BOARD</Text>
          </Pressable>
        </View>
        {posts.length === 0 ? (
          <Text style={styles.emptyPreviewText}>No posts yet.</Text>
        ) : (
          posts.map((p) => (
            <Pressable
              key={p.post_id}
              style={styles.postPreview}
              onPress={() => router.push(`/(shared)/post/${p.post_id}`)}
            >
              <Text style={styles.postTitle} numberOfLines={1}>
                {p.title}
              </Text>
              <Text style={styles.postBody} numberOfLines={2}>
                {p.body}
              </Text>
            </Pressable>
          ))
        )}
      </View>

      {/* Search + categories */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search marketplace..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(c) => c.value}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item: c }) => {
          const selected = category === c.value;
          return (
            <Pressable
              style={styles.categoryChip}
              onPress={() => setCategory(selected ? null : c.value)}
            >
              <View
                style={[
                  styles.categoryIconWrap,
                  selected && styles.categoryIconWrapSelected,
                ]}
              >
                <Ionicons
                  name={c.icon}
                  size={20}
                  color={selected ? colors.white : colors.teal}
                />
              </View>
              <Text style={styles.categoryLabel}>{c.label}</Text>
            </Pressable>
          );
        }}
      />

      <Text style={[styles.sectionHeading, styles.gridHeading]}>
        Marketplace
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title="Community Store"
        right={
          <Pressable onPress={() => router.push("/(shared)/notifications")}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.white}
            />
          </Pressable>
        }
      />

      {loading && items.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.teal} />
      ) : error ? (
        <EmptyState
          title="Couldn't load items"
          subtitle={error}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.item_id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => <ItemCard item={item} />}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <EmptyState
              title="No items found"
              subtitle="Try a different search or category."
            />
          }
          onRefresh={refetch}
          refreshing={loading}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: "700" },

  hero: {
    margin: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.teal,
    lineHeight: 30,
    marginBottom: 8,
  },
  heroBody: {
    fontSize: 14,
    color: colors.body,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.teal,
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  heroButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  section: { marginHorizontal: 16, marginBottom: 8 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeading: { fontSize: 17, fontWeight: "700", color: colors.dark },
  sectionLink: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.teal,
    letterSpacing: 0.5,
  },
  emptyPreviewText: { fontSize: 13, color: colors.muted },
  postPreview: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 3,
  },
  postBody: { fontSize: 12, color: colors.body, lineHeight: 17 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.dark },
  categoryList: { paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  categoryChip: { alignItems: "center", width: 64 },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryIconWrapSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  categoryLabel: { fontSize: 11, color: colors.dark, textAlign: "center" },
  gridHeading: { marginHorizontal: 16, marginBottom: 12 },

  gridContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  gridRow: { gap: 16 },
});
