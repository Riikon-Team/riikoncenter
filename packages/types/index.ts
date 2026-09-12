export interface TUserPreferences {
  theme: string;
  font: string;
}

export interface StandaloneApp {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'tool' | 'entertainment' | 'other';
  isEmbedded: boolean;
  externalUrl?: string;
  hasOwnBackend: boolean;
  backendUrl?: string;
}
