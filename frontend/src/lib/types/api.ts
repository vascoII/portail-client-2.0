/**
 * Base API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * API Error structure
 */
export interface ApiError {
  success: false;
  status: number;
  message: string;
  errors?: string[];
}

/**
 * User types and roles
 */
export type UserRole = 'ROLE_USER' | 'ROLE_OCCUPANT' | 'ROLE_GESTIONNAIRE' | 'ROLE_ADMIN' | 'ROLE_MAISONMERE' | 'ROLE_AGENCE' | 'ROLE_SYNDICAT';

export type UserType = 'O' | 'M' | 'A' | 'S' | 'C' | 'G';

export interface User {
  PKUser: string;
  LoginID?: string;
  UserName?: string;
  FirstName?: string;
  EMail?: string;
  Email?: string;
  PhoneNumber?: string;
  UserType?: UserType;
  UserRole?: string;
  FK?: string;
  [key: string]: any;
}

export interface UserInfo {
  pkUser: string | null;
  loginID: string | null;
  email: string | null;
  userType: UserType | null;
  roles: UserRole[];
  dashboardUrl: string | null;
}

export interface LoginResponse {
  user: User;
  roles: UserRole[];
  session_id: string;
  pk_user: number;
}


/**
 * Building (Immeuble) types
 */
export interface Building {
  PkImmeuble: string;
  Numero?: string;
  Nom?: string;
  Adresse1?: string;
  Adresse2?: string;
  Cp?: string;
  Ville?: string;
  NbAnomalies?: number;
  NbDepannages?: number;
  NbDysfonctionnements?: number;
  NbFuites?: number;
  NbCompteurs?: number;
  [key: string]: any;
}

export interface BuildingDetails extends Building {
  ImmeubleEC?: {
    Chantier?: {
      NbCompteursPoses?: number;
      NbCompteursCommandes?: number;
      DateEntreeChantier?: string;
    };
  };
}

export interface BuildingListResponse {
  immeubles: Building[];
  filters?: FilterValues;
}

export interface BuildingDetailsResponse {
  immeuble: BuildingDetails;
  evolution_charts?: any;
  comparative_chart?: any;
  tabs_top_consos?: any;
  tabs_evo_consos?: any;
  chantier?: ChantierData;
  GPS?: {
    lat?: number;
    lng?: number;
  };
  preview?: string;
  demo?: string;
}

export interface ChantierData {
  installed: number;
  installed_percent: number;
  remaining: number;
  remaining_percent: number;
  total: number;
  date: string | null;
}

/**
 * Housing (Logement) types
 */
export interface Housing {
  PkLogement: string;
  Numero?: string;
  NumBatiment?: string;
  NumEscalier?: string;
  NumEtage?: string;
  NumOrdre?: string;
  Immeuble?: Building;
  Occupant?: Occupant;
  LogementRepart?: {
    ListeInfosAppareils?: {
      infosAppareilRepart?: AppareilInfo[];
    };
    SerieConsosDJU?: any;
  };
  ListeAppareils?: {
    appareil?: Device[];
  };
  [key: string]: any;
}

export interface HousingDetailsResponse {
  logement: Housing;
  ticketOwner?: TicketOwner;
  nbTickets?: number;
  consoTabs?: any;
  changeinprogress?: boolean;
  occupant?: OccupantData;
}

export interface Device {
  PkAppareil?: string;
  Numero?: string;
  Emplacement?: string;
  Fluide?: string;
  Type?: string;
  [key: string]: any;
}

export interface AppareilInfo {
  Appareil?: Device;
  SerieConsos?: any;
  R1?: Reading;
  R2?: Reading;
  R3?: Reading;
  R4?: Reading;
  R5?: Reading;
  R6?: Reading;
  NbFuites?: number;
  NbAnomalies?: number;
  [key: string]: any;
}

export interface Reading {
  DateReleve?: string;
  Index?: number;
  Conso?: number;
  [key: string]: any;
}

/**
 * Occupant types
 */
export interface Occupant {
  PkOccupant: string;
  Nom?: string;
  Ref?: string;
  Email?: string;
  TelFixe?: string;
  TelMobile?: string;
  [key: string]: any;
}

export interface OccupantData {
  newNom?: string;
  newEmail?: string;
  newTelmobile?: string;
  [key: string]: any;
}

/**
 * Intervention types
 */
export interface Intervention {
  PkIntervention: string;
  NumIntervention?: string;
  DateIntervention?: string;
  TypeIntervention?: string;
  Statut?: string;
  [key: string]: any;
}

export interface InterventionDetails extends Intervention {
  Immeuble?: Building;
  Logement?: Housing;
  [key: string]: any;
}

export interface DepannageLogement {
  PkLogement?: string | number;
  NumBatiment?: string;
  AdrBatiment?: string;
  NumEscalier?: string;
  AdrEscalier?: string;
  NumEtage?: string;
  NumOrdre?: string;
  Type?: string;
  [key: string]: any;
}

export interface DepannageOccupant {
  PkOccupant?: string | number;
  Nom?: string;
  Ref?: string;
  DateArrivee?: string;
  DateDepart?: string;
  [key: string]: any;
}

export interface DepannageDetails {
  WorkOrderNumber?: string;
  Numero?: string;
  Statut?: string;
  StatutAbrege?: string;
  Date?: string;
  Motif?: string;
  MotifAbrege?: string;
  CompteRendu?: string;
  [key: string]: any;
}

export interface DepannageRecord {
  Logement?: DepannageLogement;
  Occupant?: DepannageOccupant;
  Depannage?: DepannageDetails;
  [key: string]: any;
}

/**
 * Ticket types
 */
export interface Ticket {
  CaseId?: string;
  CaseNumber?: string;
  FkLogement?: string;
  RefLogement?: string;
  FkImmeuble?: string;
  Imm_Id?: string;
  Statut?: string;
  Statut_Client?: string;
  TicketDate?: string;
  LastUpdateDate?: string;
  Nom?: string;
  Email?: string;
  TelFixe?: string;
  TelMobile?: string;
  MotifLibre?: string;
  ObjetRetour?: string;
  NumIntervention?: string;
  WebUser_Nom?: string;
  WebUser_Prenom?: string;
  WebUser_Tel?: string;
  WebUser_Email?: string;
  [key: string]: any;
}

export interface TicketListResponse {
  tickets: Ticket[];
  board?: DashboardData;
  filters?: FilterValues;
  showAll?: boolean;
}

export interface TicketOwner {
  Nom?: string;
  Email?: string;
  TelFixe?: string;
  TelMobile?: string;
  [key: string]: any;
}

export interface CreateTicketRequest {
  pkLogement: string | number;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  objet: string;
  message: string;
  attachment?: File;
}

export interface CreateTicketResponse {
  nbTickets: number;
  pkLogement: string | number;
}

/**
 * Dashboard types
 */
export interface DashboardData {
  NbCompteursPoses?: number;
  NbCompteursCommandes?: number;
  PcImmeublesTransfertFichiers?: string;
  [key: string]: any;
}

export interface DashboardResponse {
  board: DashboardData;
  chantier?: ChantierData;
  demo?: boolean;
}

/**
 * Anomaly, Leak, Dysfunction types
 */
export interface AnomalyDetails {
  Index?: string | number;
  Conso?: string | number;
  Observations?: string;
  [key: string]: any;
}

export interface Anomaly {
  PkAnomalie?: string;
  DateAnomalie?: string;
  TypeAnomalie?: string;
  Description?: string;
  Logement?: DepannageLogement;
  Occupant?: DepannageOccupant;
  Appareil?: Device;
  Anomalie?: AnomalyDetails;
  [key: string]: any;
}

export interface LeakDetails {
  Duree?: number;
  NbFuites?: number;
  Nombre?: number;
  NbDepassements?: number;
  NbJours?: number;
  [key: string]: any;
}

export interface Leak {
  PkFuite?: string;
  DateFuite?: string;
  TypeFuite?: string;
  Description?: string;
  Logement?: DepannageLogement;
  Occupant?: DepannageOccupant;
  Appareil?: Device;
  Fuite?: LeakDetails;
  [key: string]: any;
}

export interface DysfunctionDetails {
  Type?: string;
  TypeAbrege?: string;
  NbJours?: number;
  Duree?: number;
  [key: string]: any;
}

export interface Dysfunction {
  PkDysfonctionnement?: string;
  DateDysfonctionnement?: string;
  TypeDysfonctionnement?: string;
  Description?: string;
  Logement?: DepannageLogement;
  Occupant?: DepannageOccupant;
  Appareil?: Device;
  Dysfonctionnement?: DysfunctionDetails;
  [key: string]: any;
}

export interface AnomalyListResponse {
  anomalies: Anomaly[];
  immeuble?: BuildingDetails;
  logement?: Housing;
  filters?: FilterValues;
}

export interface LeakListResponse {
  fuites: Leak[];
  immeuble?: BuildingDetails;
  logement?: Housing;
  filters?: FilterValues;
}

export interface DysfunctionListResponse {
  dysfonctionnements: Dysfunction[];
  immeuble?: BuildingDetails;
  logement?: Housing;
  filters?: FilterValues;
}

/**
 * Filter types
 */
export interface FilterParams {
  ref?: string;
  ref_numero?: string;
  nom?: string;
  tout?: string;
  adresse?: string;
  search?: boolean;
  pkImmeuble?: string | number;
  pkLogement?: string | number;
  appareil?: string;
  [key: string]: any;
}

export interface FilterValues {
  [key: string]: string[] | number[] | any;
}

/**
 * Operator (Gestionnaire) types
 */
export interface Operator {
  PKUser: string;
  UserName?: string;
  FirstName?: string;
  EMail?: string;
  PhoneNumber?: string;
  UserRole?: string;
  NbImmeubles?: number;
  NbAppareils?: number;
  [key: string]: any;
}

export interface OperatorListResponse {
  users: Operator[];
}

export interface CreateOperatorRequest {
  job: string;
  lastname: string;
  firstname: string;
  phone: string;
  email: string | { first: string; second: string };
}

export interface UpdateOperatorRequest {
  job?: string;
  lastname?: string;
  firstname?: string;
  phone?: string;
  email?: string | { first: string; second: string };
}

export interface UpdatePasswordRequest {
  password: string;
  password_confirm?: string;
}

/**
 * Invoice (Facture) types
 */
export interface Invoice {
  pkFacture: string;
  numero?: string;
  dateEdition?: string;
  dateEditionFormatted?: string;
  montantTotalHT?: number;
  montantTotalHTFormatted?: string;
  montantTotalTTC?: number;
  montantTotalTTCFormatted?: string;
  montantTotalAPayer?: number;
  montantTotalAPayerFormatted?: string;
  codeGestio?: string;
  adresse?: string;
  ville?: string;
  cp?: string;
}

export interface InvoiceListResponse {
  factures: Invoice[];
  count: number;
}

/**
 * Report types
 */
export interface ReportParams {
  PKIMMEUBLE?: string | number;
  PKLOGEMENT?: string | number;
  PKOCCUPANT?: string | number;
  PKUSER?: string | number;
  DATE1?: string;
  DATE2?: string;
  type?: string;
  energie?: string;
  date?: string;
}

export interface ReportResponse {
  content: string; // Base64 encoded PDF/Excel
  contentType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  filename: string;
}

/**
 * Search types
 */
export interface SearchParams {
  type?: 'immeuble' | 'occupant';
  ref?: string;
  ref_numero?: string;
  nom?: string;
  tout?: string;
  adresse?: string;
  search?: boolean;
}

export interface SearchResponse {
  results: Building[] | Housing[];
  type: 'immeuble' | 'occupant';
}

/**
 * Front/General API types
 */
export interface LegalNotices {
  title: string;
  content: string;
  lastUpdated: string;
}

export interface Subcontractor {
  Nom?: string;
  Adresse?: string;
  [key: string]: any;
}

export interface PersonalDataResponse {
  sousTraitants: Subcontractor[];
}

export interface CGUStatusResponse {
  typeUser: string | null;
  needsValidation: boolean;
}

export interface CGUValidationRequest {
  email: string;
  email_confirm: string;
  valid_cgu: boolean;
}

/**
 * Chart and consumption types
 */
export interface ConsumptionTab {
  [key: string]: any;
}

export interface ChartData {
  labels?: string[];
  datasets?: any[];
  [key: string]: any;
}

/**
 * Account types
 */
export interface Account {
  job?: string;
  lastname?: string;
  firstname?: string;
  phone?: string;
  email?: string;
}

/**
 * Statistics types
 */
export interface OccupantStatistics {
  [key: string]: any;
}

