export interface BlogPost {
  id: string;
  title: string;
  content: string;
  image: string; // Renamed from imageUrl to match user request
  category: string;
  createdAt: any; // Firestore Timestamp
  views: number;
  productLink?: string;
}

export interface Analytics {
  pageViews: number;
  totalPageViews: number; // For clarity
  dailyStats?: {
    date: string;
    views: number;
  }[];
}

export interface WebsiteSettings {
  instagram: string;
  facebook: string;
  pinterest: string;
  youtube: string;
  editorName: string;
  editorBio: string;
  profileImage: string;
  websiteLogo: string;
  footerText: string;
  contact?: {
    email: string;
    phone: string;
  };
}
