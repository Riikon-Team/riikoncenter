/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Quote {
  text: string;
  author: string;
}

export interface AboutTranslation {
  title: string;
  subtitle: string;
  philosophyTitle: string;
  philosophyDesc: string;
  secTitle: string;
  secDesc: string;
  speedTitle: string;
  speedDesc: string;
  shortcutsTitle: string;
  shortcutItems: { label: string; desc: string }[];
  signature: string;
  signatureSerene: string;
  signatureProd: string;
  closeLabel: string;
  version: string;
  stableBuild: string;
  changelog: string;
}

export interface BookmarksTranslation {
  title: string;
  subtitle: string;
  all: string;
  addNew: string;
  closeForm: string;
  nameLabel: string;
  namePlaceholder: string;
  urlLabel: string;
  urlPlaceholder: string;
  categoryLabel: string;
  iconLabel: string;
  cancel: string;
  save: string;
  emptyState: string;
  totalCount: string;
  storageType: string;
  categories: Record<string, string>;
}

export interface NotesTranslation {
  title: string;
  autosaved: string;
  deleteNotes: string;
  placeholder: string;
  stats: string;
  autoSaveHint: string;
  saving: string;
}

export interface FocusTranslation {
  title: string;
  completedToday: string;
  sessionCount: string;
  muteAlert: string;
  unmuteAlert: string;
  pause: string;
  start: string;
  reset: string;
  phases: {
    work: string;
    shortBreak: string;
    longBreak: string;
  };
  modes: {
    work: string;
    shortBreak: string;
    longBreak: string;
  };
}

export interface KanbanTranslation {
  title: string;
  subtitle: string;
  addColumnBtn: string;
  deleteColumnTooltip: string;
  addCardBtn: string;
  cardTitleLabel: string;
  cardTitlePlaceholder: string;
  cardDescLabel: string;
  cardDescPlaceholder: string;
  cardCatLabel: string;
  cardCatPlaceholder: string;
  cardPriorityLabel: string;
  priorities: {
    low: string;
    medium: string;
    high: string;
  };
  cardDueDateLabel: string;
  cardDueDatePlaceholder: string;
  cardSubtasksLabel: string;
  cardSubtasksPlaceholder: string;
  saveCardBtn: string;
  cancelBtn: string;
  subtasksLabel: string;
  dueDateLabel: string;
  dueTimeTitle: string;
  exportLabel: string;
  importLabel: string;
  priorityNameLabel: string;
  emptyBoard: string;
  totalCards: string;
  importSuccess: string;
  importFail: string;
  deleteCardConfirm: string;
  deleteColumnConfirm: string;
  newColumnLabel: string;
  newColumnPlaceholder: string;
  saveColumnBtn: string;
  exportJSON: string;
  exportCSV: string;
  importJSON: string;
  importCSV: string;
  tapToBrowse: string;
  orDropLabel: string;
  subtasksDone: string;
  addCardTrigger: string;
  weeklyProductivity: string;
  weeklyProductivityDesc: string;
  completed: string;
  activeDays: string;
  completedTasksTrend: string;
  completedLabel: string;
  destColumn: string;
  newColumn: string;
  columnLabel: string;
  accentTheme: string;
  cancel: string;
  save: string;
  doubleClickEditCol: string;
  changeColColor: string;
  editCol: string;
  deleteCol: string;
  emptyCol: string;
  subtasksTitle: string;
  deleteCard: string;
  markIncomplete: string;
  markComplete: string;
  columnAccentTheme: string;
  addColumn: string;
  dragInstructions: string;
  presetTodo: string;
  presetDoing: string;
  presetDone: string;
  defaultCategory: string;
  defaultDueDate: string;
  colorNames: Record<string, string>;
}

export interface WeatherTranslation {
  titleLabel: string;
  viewDetails: string;
  highTemp: string;
  lowTemp: string;
  updatedRealtime: string;
  localClimate: string;
  detailedTitle: string;
  statusLabel: string;
  windSpeedLabel: string;
  humidityLabel: string;
  visibilityLabel: string;
  uvLabel: string;
  forecastTitle: string;
  forecastIcons: {
    rain: string;
    sunny: string;
    cloudy: string;
  };
  closeLabel: string;
  conditions: {
    cloudy: string;
    lightSun: string;
    showers: string;
    sunny: string;
    fog: string;
    storm: string;
  };
  uvLevels: {
    low: string;
    moderate: string;
    high: string;
    veryHigh: string;
    dangerous: string;
  };
}

export interface GitHubTranslation {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  searchBtn: string;
  previewBanner: string;
  followers: string;
  following: string;
  repos: string;
  metricStars: string;
  metricCommits: string;
  metricPrs: string;
  metricIssues: string;
  contributionsTitle: string;
  contributionsCols: string;
  less: string;
  more: string;
  langTitle: string;
  techTipTitle: string;
  techTipDesc: string;
  footerHelp: string;
  footerDashboard: string;
  offlineBio: string;
  userNotFound: string;
  sevenDayHeatmap: string;
  realTimeSync: string;
  events: string;
  noContributions: string;
  contributions: string;
  noLangStats: string;
  weekdays: string[];
}

export interface SettingsTranslation {
  title: string;
  subtitle: string;
  tabs: {
    visual: string;
    weather: string;
    widgets: string;
    clock: string;
  };
  accentColorLabel: string;
  wallpapersLabel: string;
  customWallpaperLabel: string;
  customWallpaperPlaceholder: string;
  apply: string;
  customWallpapersSection: string;
  customWallpapersDesc: string;
  addWallpaperBtn: string;
  uploadWallpaperLabel: string;
  uploadHelpText: string;
  noCustomWallpapers: string;
  clockSettings: {
    styleLabel: string;
    styles: {
      sans: string;
      heading: string;
      mono: string;
      space: string;
      playfair: string;
    };
    blinkDividerLabel: string;
    blinkDividerDesc: string;
    showAmPmLabel: string;
    showAmPmDesc: string;
    showDateLabel: string;
    showDateDesc: string;
    dateFormatLabel: string;
    formats: {
      full: string;
      short: string;
      numeric: string;
    };
  };
  blurLabel: string;
  clockWeightLabel: string;
  weights: {
    light: string;
    regular: string;
    medium: string;
    bold: string;
  };
  cityLabel: string;
  cityPlaceholder: string;
  cityHelp: string;
  unitLabel: string;
  unitCelsius: string;
  unitFahrenheit: string;
  bentoLabel: string;
  bentoWeatherTitle: string;
  bentoWeatherDesc: string;
  bentoFocusTitle: string;
  bentoFocusDesc: string;
  bentoNotesTitle: string;
  bentoNotesDesc: string;
  timeFormatLabel: string;
  timeFormat12h: string;
  showSeconds: string;
  systemLanguage: string;
  languageVi: string;
  languageEn: string;
  footerVersion: string;
  footerHelp: string;
}

export interface KeyboardShortcutsTranslation {
  title: string;
  subtitle: string;
  pressKey: string;
  categories: {
    dialogs: string;
    controls: string;
    general: string;
  };
  shortcutsList: {
    kanban: string;
    bookmarks: string;
    github: string;
    settings: string;
    about: string;
    widgets: string;
    sound: string;
    pomodoro: string;
    help: string;
  };
}

export interface SoundBoardTranslation {
  configureMusic: string;
  previousTrack: string;
  nextTrack: string;
  play: string;
  pause: string;
  mute: string;
  volumeSlider: string;
  soundPlaying: string;
  focus: string;
  sound: string;
  setupTitle: string;
  close: string;
  preloadedSoundscapes: string;
  types: {
    lofi: string;
    rain: string;
    custom: string;
  };
  chooseLocalFile: string;
  fileUpload: string;
  addToPlaylist: string;
  trackLabelPlaceholder: string;
  save: string;
  myPlaylist: string;
  deleteItem: string;
  noSavedTracks: string;
  playingLofi: string;
  playingRain: string;
  customActive: string;
  clearSource: string;
  helpText: string;
}
