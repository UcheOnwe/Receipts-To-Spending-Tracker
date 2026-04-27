import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme/fonts';
import { edgeMargin } from '../theme/layout';

type NavRoute = keyof Pick<
  RootStackParamList,
  'BarGraph' | 'WeeklySpending' | 'Description' | 'Scan' | 'ViewReceipt'
>;

type NavItem = {
  label: string;
  route: NavRoute;
  icon: keyof typeof Ionicons.glyphMap;
};

const topRow: NavItem[] = [
  { label: 'Bar Graph', route: 'BarGraph', icon: 'stats-chart-outline' },
  { label: 'weekly spending', route: 'WeeklySpending', icon: 'pie-chart-outline' },
  { label: 'Description', route: 'Description', icon: 'reorder-three-outline' },
];

const bottomRow: NavItem[] = [
  { label: 'Scan', route: 'Scan', icon: 'camera-outline' },
  { label: 'Tracker', route: 'ViewReceipt', icon: 'list-outline' },
  { label: 'Data', route: 'WeeklySpending', icon: 'document-text-outline' },
];

type Props = {
  active: NavRoute;
};

export function DataBottomNav({ active }: Props) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const padLeft = Math.max(edgeMargin, insets.left);
  const padRight = Math.max(edgeMargin, insets.right);

  const renderItem = (item: NavItem) => {
    const isActive =
      active === item.route || (item.label === 'Data' && (active === 'WeeklySpending' || active === 'Description'));
    const tint = isActive ? '#1493FF' : '#7D7D7D';

    return (
      <Pressable
        key={item.label}
        style={styles.item}
        onPress={() => navigation.navigate(item.route as never)}
        hitSlop={6}
      >
        <Ionicons name={item.icon} size={22} color={tint} />
        <Text style={[styles.label, { color: tint }]}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { width, marginLeft: -padLeft, marginRight: -padRight }]}>
      <View style={styles.row}>{topRow.map(renderItem)}</View>
      <View style={styles.divider} />
      <View style={styles.row}>{bottomRow.map(renderItem)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: '#07090E',
    borderTopWidth: 1,
    borderColor: '#111827',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 54,
  },
  item: {
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#111827',
  },
});
