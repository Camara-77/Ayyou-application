/**
 * Contrats d'interfaces TypeScript pour le module Identité & Authentification AYYOU.
 * Alignés sur l'API Django REST Framework (AYYOU-BACKEND).
 */

export interface LoginRequest {
  identifier: string; // Email ou Numéro de téléphone
  password: string;
}

export interface LoginResponse {
  message?: string;
  access?: string;
  refresh?: string;
  token?: string; // Fallback de rétrocompatibilité
  user?: User;    // Fallback de rétrocompatibilité
  utilisateur?: DjangoUser;
}

export interface RegisterFormValue {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface RegisterBackendPayload {
  prenom: string;
  nom: string;
  numero_telephone: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  message: string;
  verification_required: boolean;
  verification_type: string;
}

export interface VerifyOtpRequest {
  numero_telephone: string;
  code: string;
}

export interface VerifyOtpResponse {
  message: string;
  verified: boolean;
}

export interface DjangoUser {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  numero_telephone: string;
  est_verifie: boolean;
  mode_actif?: 'CLIENT' | 'LIVREUR';
  available_modes?: string[];
  has_driver_profile?: boolean;
  roles?: string[];
  pro_status?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE';
  merchant_status?: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | null;
  driver_status?: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | null;
  etablissement?: any;
  profil_livreur?: any;
}

export interface User {
  id: string | number;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
  roles?: string[];
  activeMode?: 'CLIENT' | 'LIVREUR';
  availableModes?: string[];
  hasDriverProfile?: boolean;
  proStatus?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NONE';
  merchantStatus?: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | null;
  driverStatus?: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | null;
  etablissement?: any;
  profilLivreur?: any;
}

export interface UserModeResponse {
  active_mode: 'CLIENT' | 'LIVREUR';
  available_modes: string[];
  can_switch_to_driver?: boolean;
  driver_status?: string | null;
}

