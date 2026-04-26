export const fonts = {
  interRegular: 'Inter_400Regular',
  interSemi: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
  kameronBold: 'Kameron_700Bold',
  jacques: 'JacquesFrancois_400Regular',
  robotoSemi: 'Roboto_600SemiBold',
} as const;

export const colors = {
  /** Same as screen background everywhere (Figma Color/Background) */
  canvas: '#FDFEFF',
  bg: '#FDFEFF',
  primary: '#173372',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  inputBg: '#E5E5E5',
  /** View Receipt search — Progress report/CSS/view_recipt_screen (M3 surface-container-high) */
  searchBg: '#ECE6F0',
  /** M3 on-surface-variant for search leading/trailing icons */
  searchBarIcon: '#49454F',
  /** Receipt list cards — Progress report/CSS/view_recipt_screen Rectangle 3 */
  viewReceiptCardBg: '#F4EAEA',
  cardBg: '#F5F5F5',
  border: '#1E1E1E',
  /** Scan screen cards — Progress report/CSS/scan_screen Rectangle 1 */
  greyBox: '#D9D9D9',
  black: '#000000',
} as const;

export const APP_NAME = 'Receipt Tracker';
