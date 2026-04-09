export type Region =
  | "West Africa"
  | "East Africa"
  | "Central Africa"
  | "South Asia";

export type ConnectivityLevel = "Low" | "Variable" | "Moderate" | "Strong";
export type ProgramStatus = "Pilot" | "Scaling" | "Routine use";
export type LabType =
  | "Public hospital"
  | "University hospital"
  | "National reference lab"
  | "District hospital"
  | "Private partner";
export type LabSize = "Small" | "Medium" | "Large";
export type LisStatus = "No LIS" | "Pilot mapping" | "Partial integration" | "Stable integration";
export type AdoptionLevel = "Emerging" | "Stable" | "Advanced";
export type DataQuality = "Low" | "Moderate" | "Good" | "Trusted";
export type UserRole =
  | "Lab technician"
  | "Microbiologist"
  | "QA lead"
  | "Program admin"
  | "IT focal point";
export type TrainingLevel = "Basic" | "Intermediate" | "Advanced";
export type FeedbackChannel = "Survey" | "In-app" | "WhatsApp" | "Support ticket" | "Call";
export type FeedbackType = "UX" | "Bug" | "Bacteria content" | "Performance" | "LIS" | "Training";
export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Status = "Open" | "In progress" | "Monitoring" | "Closed";
export type DeviceType = "Desktop" | "Laptop" | "Shared workstation" | "Tablet";
export type SampleType = "Blood" | "Urine" | "Respiratory" | "Wound swab" | "Stool";
export type Interpretation = "S" | "I" | "R";

export interface Country {
  id: string;
  name: string;
  region: Region;
  connectivityLevel: ConnectivityLevel;
  dataSharingPolicy: string;
  labCount: number;
  programStatus: ProgramStatus;
  startDate: string;
}

export interface Lab {
  id: string;
  name: string;
  countryId: string;
  city: string;
  type: LabType;
  size: LabSize;
  deploymentDate: string;
  currentVersion: string;
  lisStatus: LisStatus;
  adoptionLevel: AdoptionLevel;
  dataQuality: DataQuality;
  connectivityLevel: ConnectivityLevel;
  usersByRole: Record<UserRole, number>;
  estimatedMonthlyLoad: number;
}

export interface User {
  id: string;
  labId: string;
  countryId: string;
  role: UserRole;
  activationDate: string;
  lastActiveDate: string;
  usageFrequency: "Daily" | "Weekly" | "Occasional";
  language: "French" | "English" | "Bangla" | "Nepali";
  trainingLevel: TrainingLevel;
  primaryFeedbackChannel: FeedbackChannel;
}

export interface VersionRelease {
  id: string;
  releaseDate: string;
  majorChanges: string[];
  lisCompatibility: string;
  stabilityScore: number;
}

export interface VersionRollout {
  versionId: string;
  labId: string;
  countryId: string;
  rolloutDate: string;
}

export interface SessionEvent {
  id: string;
  date: string;
  labId: string;
  userId: string;
  countryId: string;
  durationMinutes: number;
  deviceType: DeviceType;
  mode: "Online" | "Offline";
  syncSuccess: boolean;
  averageResponseMs: number;
  crash: boolean;
  keyEventCount: number;
}

export interface AstRecord {
  id: string;
  date: string;
  labId: string;
  countryId: string;
  sampleType: SampleType;
  bacteria: string;
  antibiotic: string;
  testCount: number;
  softwareInterpretation: Interpretation;
  referenceInterpretation: Interpretation;
  concordant: boolean;
  criticalError: boolean;
  requiresManualValidation: boolean;
  entryTimeMinutes: number;
  validationTimeMinutes: number;
  versionId: string;
}

export interface LisIntegrationRecord {
  id: string;
  labId: string;
  countryId: string;
  lisType: string;
  month: string;
  importCount: number;
  successRate: number;
  errorCount: number;
  latencyMinutes: number;
  incidents: number;
  activationDate: string;
}

export interface FeedbackRecord {
  id: string;
  date: string;
  countryId: string;
  labId: string;
  channel: FeedbackChannel;
  type: FeedbackType;
  severity: Severity;
  status: Status;
  responseHours: number;
  nps: number;
  csat: number;
  verbatim: string;
}

export interface IncidentRecord {
  id: string;
  date: string;
  type: string;
  severity: Severity;
  countryId: string;
  labId: string;
  versionId: string;
  triggerKpi: string;
  actionTaken: string;
  owner: string;
  status: Status;
  closedDate?: string;
}

export interface DashboardData {
  generatedAt: string;
  countries: Country[];
  labs: Lab[];
  users: User[];
  versions: VersionRelease[];
  rollouts: VersionRollout[];
  sessions: SessionEvent[];
  astRecords: AstRecord[];
  lisIntegrations: LisIntegrationRecord[];
  feedback: FeedbackRecord[];
  incidents: IncidentRecord[];
}

export interface GlobalFiltersState {
  periodMonths: number;
  countryIds: string[];
  regions: Region[];
  labIds: string[];
  labTypes: LabType[];
  versionIds: string[];
  lisStatuses: LisStatus[];
  usageModes: Array<"Online" | "Offline">;
  connectivityLevels: ConnectivityLevel[];
  userRoles: UserRole[];
  bacteria: string[];
  antibiotics: string[];
  feedbackTypes: FeedbackType[];
  incidentSeverities: Severity[];
  capaStatuses: Status[];
}
