export type UserRole = 'super_admin' | 'admin' | 'agent' | 'citizen';

export interface UserProfile {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface CitizenProfile {
  id: string;
  npi: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  updated_at: string;
}

export interface Tenant {
  id: string;
  department_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  theme_config: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  is_active: boolean;
  site_config?: any;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code_iso: string;
  history?: string;
  images?: string[];
  communes?: string[];
  created_at: string;
}

export interface PublicService {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
  required_documents: string[];
  procedure_steps: string | null;
  global_status: 'online' | 'partial' | 'physical';
  external_link: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TenantService {
  id: string;
  tenant_id: string;
  service_id: string;
  is_active: boolean;
  is_visible: boolean;
  custom_price: number | null;
  custom_documents: string[] | null;
  custom_procedure: string | null;
  custom_status: string | null;
  custom_link: string | null;
  created_at: string;
  service?: PublicService;
}

export interface DossierStatus {
  id: string;
  label: string;
  color_code: string;
}

export interface Dossier {
  id: string;
  tenant_id: string;
  citizen_id: string;
  service_id: string;
  status_id: string;
  tracking_code: string;
  submission_data: any;
  created_at: string;
  updated_at: string;
  status?: DossierStatus;
  tenant_service?: TenantService;
  tenant?: Tenant;
}

export interface DossierHistory {
  id: string;
  dossier_id: string;
  status_id: string;
  agent_id: string | null;
  notes: string | null;
  created_at: string;
  status?: DossierStatus;
}

export interface FileStorage {
  id: string;
  tenant_id: string | null;
  owner_id: string;
  original_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  current_version_id: string | null;
  created_at: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  version_number: number;
  storage_path: string;
  created_by: string;
  change_summary: string | null;
  created_at: string;
}

export interface CitizenDocument {
  id: string;
  citizen_id: string;
  file_id: string;
  category: 'identity' | 'receipt' | 'official_act';
  created_at: string;
  file?: FileStorage;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  action_url: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
}

export interface NotificationTarget {
  id: string;
  notification_id: string;
  tenant_id: string | null;
  user_id: string | null;
  role_target: UserRole | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  notification?: Notification;
}

export interface Payment {
  id: string;
  tenant_id: string;
  dossier_id: string;
  amount: number;
  currency: string;
  gateway_ref: string | null;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export interface Signalement {
  id: string;
  tenant_id: string;
  citizen_id: string | null;
  category: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'pending' | 'under_review' | 'assigned' | 'resolved' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to: string | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  citizen?: UserProfile;
  agent?: UserProfile;
}

export interface News {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  image_url: string | null;
  category: string | null;
  author_id: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  tenants?: {
    name: string;
    slug: string;
  };
}

export interface NewsComment {
  id: string;
  news_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export interface NewsLike {
  news_id: string;
  user_id: string;
  created_at: string;
}

export interface NewsBookmark {
  news_id: string;
  user_id: string;
  created_at: string;
}
