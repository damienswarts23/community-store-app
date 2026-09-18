import { colors } from "@/src/theme/colors";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenHeaderProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export default function ScreenHeader({
  title,
  left,
  right,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.side}>{left}</View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  side: { minWidth: 24, alignItems: "flex-start" },
  sideRight: { alignItems: "flex-end" },
  title: {
    flex: 1,
    textAlign: "center",
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
