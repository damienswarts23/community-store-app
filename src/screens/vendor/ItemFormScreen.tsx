import ScreenHeader from "@/src/components/ScreenHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { itemService, type ItemCategory } from "@/src/services/itemService";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

const categories: ItemCategory[] = [
  "books",
  "electronics",
  "household",
  "fashion",
  "leisure",
];

export default function ItemFormScreen() {
  const { session } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const editing = Boolean(id);

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    loadItem(id);
  }, [id]);

  const loadItem = async (itemId: string) => {
    try {
      const item = await itemService.getById(itemId);

      if (!item) {
        Alert.alert("Item not found", "This item could not be found.");
        router.back();
        return;
      }

      setName(item.item_name);
      setDescription(item.item_description);
      setPrice(String(item.price));
      setImageUrl(item.image_url ?? "");
      setCategory(item.category);
      setTag(item.tag ?? "");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to load item.",
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter an item name.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing description", "Please enter an item description.");
      return;
    }

    const numericPrice = Number(price);

    if (!price.trim() || Number.isNaN(numericPrice)) {
      Alert.alert("Invalid price", "Please enter a valid price.");
      return;
    }

    if (numericPrice < 0) {
      Alert.alert("Invalid price", "Price cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      const fields = {
        item_name: name.trim(),
        item_description: description.trim(),
        image_url: imageUrl.trim() || null,
        price: numericPrice,
        category,
        tag: tag.trim() || null,
      };

      if (editing && id) {
        await itemService.update(id, fields);
      } else {
        await itemService.create({
          vendor_id: session.user.id,
          ...fields,
        });
      }

      Alert.alert(
        editing ? "Item updated" : "Item created",
        editing
          ? "Your item has been updated."
          : "Your item has been added to the marketplace.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Unable to save",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Item</Text>
        </View>

        <View style={styles.loading}>
          <ActivityIndicator color={colors.teal} />
          <Text style={styles.loadingText}>Loading item...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader
        title={editing ? "Edit Item" : "Add Item"}
        left={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {editing ? "Update your item" : "Create a new item"}
        </Text>

        <Text style={styles.subtitle}>
          {editing
            ? "Update the information shown to customers."
            : "Add a product to your marketplace listing."}
        </Text>

        <Field
          label="ITEM NAME"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Calculus textbook"
        />

        <Field
          label="DESCRIPTION"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your item..."
          multiline
        />

        <Field
          label="PRICE"
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Field
          label="IMAGE URL"
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://..."
          keyboardType="url"
          autoCapitalize="none"
        />

        <Field
          label="TAG"
          value={tag}
          onChangeText={setTag}
          placeholder="e.g. NEW, USED, SALE"
        />

        <Text style={styles.label}>CATEGORY</Text>

        <View style={styles.categoryGrid}>
          {categories.map((option) => {
            const selected = category === option;

            return (
              <Pressable
                key={option}
                style={[
                  styles.categoryButton,
                  selected && styles.categoryButtonSelected,
                ]}
                onPress={() => setCategory(selected ? null : option)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.categoryTextSelected,
                  ]}
                >
                  {option.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.saveButton, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color={colors.white} />

              <Text style={styles.saveText}>
                {editing ? "SAVE CHANGES" : "CREATE ITEM"}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "decimal-pad" | "url";
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, multiline && styles.multiline]}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },

  header: {
    backgroundColor: colors.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.dark,
  },

  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 5,
    marginBottom: 20,
    lineHeight: 18,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.6,
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    color: colors.dark,
    backgroundColor: colors.white,
  },

  multiline: {
    minHeight: 100,
    paddingTop: 11,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  categoryButtonSelected: {
    borderColor: colors.teal,
    backgroundColor: "#EAF3F5",
  },

  categoryText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.muted,
  },

  categoryTextSelected: {
    color: colors.teal,
  },

  saveButton: {
    backgroundColor: colors.teal,
    borderRadius: 6,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  saveText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  disabled: {
    opacity: 0.65,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  loadingText: {
    color: colors.muted,
    fontSize: 12,
  },
});
