// Backend'in döndürdüğü JSON şekilleri. Tarihler JSON'da ISO string olarak gelir.
// Not: profil / oturum kullanıcısı `id` alanıyla (User.toPublicJSON), listelerdeki kullanıcı kartları `_id` ile gelir.

export type ID = string;
export type ISODate = string;

export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data: T;
}

// Hata gövdesi: { message, errors?: [{ field, message }] }
export interface ApiErrorBody {
  success?: false;
  message?: string;
  errors?: { field?: string; message: string }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

// --- Kullanıcılar ---

// Listelerde, yazar / grup kurucusu / yorum sahibi olarak dönen kısa görünüm.
export interface UserCard {
  _id: ID;
  fullName: string;
  avatarUrl?: string;
  university?: string;
  department?: string;
  followersCount?: number;
  isOwner?: boolean; // grup üye listesinde
}

// Notu beğenenler listesindeki kişi: izleyicinin onu takip edip etmediği ve kendisi olup olmadığı ile.
export interface NoteLiker extends UserCard {
  isFollowing: boolean;
  isMe: boolean;
}

// Başka kullanıcıların görebileceği profil (User.toPublicJSON).
export interface PublicUser {
  id: ID;
  fullName: string;
  university: string;
  department: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  createdAt: ISODate;
}

// Oturum açan kullanıcının kendi hesabı (User.toSafeJSON).
export interface AuthUser extends PublicUser {
  email: string;
  isVerified: boolean;
}

export interface ProfileStats {
  notesCount: number;
  totalLikes: number;
  totalDownloads: number;
}

export interface ProfileData {
  user: PublicUser;
  stats: ProfileStats;
  isFollowing: boolean;
  isBlocked: boolean;
  isMe: boolean;
}

// --- Notlar ---

export type FileType = 'pdf' | 'docx' | 'image' | 'archive';
export type NoteVisibility = 'public' | 'followers';
export type NoteSort = 'newest' | 'popular' | 'downloads' | 'oldest';

interface NoteBase {
  _id: ID;
  title: string;
  description: string;
  university: string;
  department: string;
  courseCode?: string;
  courseName: string;
  instructorName?: string;
  semester?: string;
  visibility?: NoteVisibility;
  originalName: string;
  fileType: FileType;
  fileSize: number;
  downloadsCount: number;
  createdAt: ISODate;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

// Not listelerindeki kart görünümü.
export interface NoteCard extends NoteBase {
  author: UserCard;
}

export interface Comment {
  _id: ID;
  user: UserCard | null;
  text: string;
  createdAt: ISODate;
}

export interface NoteDetail extends NoteBase {
  author: UserCard;
  comments: Comment[];
  group?: { _id: ID; name: string; isPrivate: boolean } | null;
  isOwner: boolean;
  updatedAt: ISODate;
}

export interface NoteFilters {
  universities: string[];
  departments: string[];
  semesters: string[];
  fileTypes: FileType[];
}

export interface TrendingCourse {
  courseCode?: string;
  courseName: string;
  notesCount: number;
}

export interface NoteSearchParams {
  q?: string;
  university?: string;
  department?: string;
  courseCode?: string;
  courseName?: string;
  instructorName?: string;
  semester?: string;
  fileType?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// --- Gruplar ---

export interface GroupCard {
  _id: ID;
  name: string;
  description: string;
  isPrivate: boolean;
  createdAt: ISODate;
  membersCount: number;
  notesCount: number;
  isMember: boolean;
  isPending: boolean;
  owner: UserCard;
}

export interface GroupDetail extends GroupCard {
  updatedAt: ISODate;
  isOwner: boolean;
  pendingCount?: number; // sadece kurucuya
}

export interface GroupMessage {
  _id: ID;
  group: ID;
  user: UserCard | null;
  text: string;
  createdAt: ISODate;
}

// --- Mesajlar ---

export interface ConversationSummary {
  _id: ID;
  otherUser: UserCard | null;
  lastMessage: {
    text: string;
    hasNote: boolean;
    isMine: boolean;
    createdAt: ISODate;
  };
  unreadCount: number;
}

export interface MessageNote {
  _id: ID;
  title: string;
  courseCode?: string;
  courseName: string;
  fileType: FileType;
}

export interface DirectMessage {
  _id: ID;
  sender: ID;
  text: string;
  note: MessageNote | null;
  createdAt: ISODate;
}

export interface ConversationDetail {
  conversation: {
    _id: ID;
    otherUser: UserCard | null;
    blockedByMe: boolean;
    blockedMe: boolean;
  };
  messages: DirectMessage[];
  markedRead: boolean;
}

// --- Bildirimler ---

export type NotificationType = 'like' | 'comment' | 'follow' | 'group_join' | 'group_request' | 'group_approved';

export interface AppNotification {
  _id: ID;
  type: NotificationType;
  actor: UserCard;
  note?: { _id: ID; title: string } | null;
  group?: { _id: ID; name: string } | null;
  text?: string;
  read: boolean;
  createdAt: ISODate;
}

export interface SiteStats {
  users: number;
  notes: number;
  groups: number;
  downloads: number;
}

// --- İstek gövdeleri ---

// Not yükleme / düzenleme formunun alanları (yüklemede FormData'ya çevrilir, group sadece yüklemede gider).
export interface NoteInput {
  title: string;
  description: string;
  courseName: string;
  courseCode: string;
  instructorName: string;
  semester: string;
  university: string;
  department: string;
  visibility: NoteVisibility;
  group: string;
}

export interface GroupInput {
  name: string;
  description: string;
  isPrivate: boolean;
}

export interface ProfileInput {
  fullName: string;
  university: string;
  department: string;
  bio: string;
}
