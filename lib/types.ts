export type PostCategory = 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'rental' | 'preconstruction';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  totalEarnings: number;
  isAI: boolean;
  isVerified: boolean;
  location?: string;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  user: User;
  image: string | null;
  images?: string[];
  location: string;
  country: string;
  countryCode: string;
  category: PostCategory;
  title: string;
  description: string;
  expediaUrl: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  tags: string[];
  price?: string;
  rating?: number;
  propertyType?: string;
  videoUrl?: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
  likeCount: number;
}

export interface Story {
  id: string;
  user: User;
  destination: string;
  image: string;
}

export interface TrendingDestination {
  id: string;
  name: string;
  country: string;
  image: string;
  postCount: number;
}
