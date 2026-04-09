import {
  type AstRecord,
  type ConnectivityLevel,
  type Country,
  type DashboardData,
  type DataQuality,
  type FeedbackRecord,
  type IncidentRecord,
  type Lab,
  type LisIntegrationRecord,
  type LisStatus,
  type ProgramStatus,
  type SessionEvent,
  type User,
  type UserRole,
  type VersionRelease,
  type VersionRollout,
} from "../types";

const END_DATE = new Date("2026-04-01T00:00:00Z");

const countryBlueprints = [
  {
    id: "senegal",
    name: "Senegal",
    region: "West Africa",
    connectivityLevel: "Moderate",
    dataSharingPolicy: "Ministry-approved aggregation with local data retention",
    programStatus: "Scaling",
    startDate: "2024-04-18",
    labs: [
      ["Hôpital Général de Dakar - Microbiologie", "Dakar", "University hospital"],
      ["Institut Pasteur Dakar - Bactériologie", "Dakar", "National reference lab"],
      ["CHU Saint-Louis - Laboratoire de Microbiologie", "Saint-Louis", "Public hospital"],
    ],
  },
  {
    id: "civ",
    name: "Côte d’Ivoire",
    region: "West Africa",
    connectivityLevel: "Variable",
    dataSharingPolicy: "Country data stays in-country; export requires programme approval",
    programStatus: "Scaling",
    startDate: "2024-01-09",
    labs: [
      ["CHU Treichville - Bactériologie", "Abidjan", "University hospital"],
      ["Institut National d’Hygiène Publique - AST Unit", "Abidjan", "National reference lab"],
      ["CHR Bouaké - Microbiologie", "Bouaké", "Public hospital"],
    ],
  },
  {
    id: "cameroon",
    name: "Cameroon",
    region: "Central Africa",
    connectivityLevel: "Variable",
    dataSharingPolicy: "Hybrid telemetry with quarterly local audit review",
    programStatus: "Pilot",
    startDate: "2024-07-02",
    labs: [
      ["Yaoundé Central Hospital - Microbiology", "Yaoundé", "Public hospital"],
      ["Douala Laquintinie Hospital Lab", "Douala", "University hospital"],
      ["Centre Pasteur du Cameroun", "Yaoundé", "National reference lab"],
    ],
  },
  {
    id: "kenya",
    name: "Kenya",
    region: "East Africa",
    connectivityLevel: "Strong",
    dataSharingPolicy: "Site-level telemetry consent with de-identified central monitoring",
    programStatus: "Routine use",
    startDate: "2023-11-13",
    labs: [
      ["Kenyatta National Hospital - Microbiology", "Nairobi", "University hospital"],
      ["Kisumu County Referral Lab", "Kisumu", "Public hospital"],
      ["Moi Teaching and Referral Hospital Lab", "Eldoret", "University hospital"],
      ["Aga Khan University Hospital Nairobi", "Nairobi", "Private partner"],
    ],
  },
  {
    id: "rwanda",
    name: "Rwanda",
    region: "East Africa",
    connectivityLevel: "Strong",
    dataSharingPolicy: "National stewardship programme with governed cross-site reporting",
    programStatus: "Routine use",
    startDate: "2023-09-01",
    labs: [
      ["Rwanda National Reference Lab", "Kigali", "National reference lab"],
      ["CHUK Kigali - Microbiology", "Kigali", "University hospital"],
      ["Butare University Teaching Hospital Lab", "Huye", "Public hospital"],
    ],
  },
  {
    id: "uganda",
    name: "Uganda",
    region: "East Africa",
    connectivityLevel: "Moderate",
    dataSharingPolicy: "Programme dashboards allowed, raw exports restricted by site",
    programStatus: "Scaling",
    startDate: "2024-03-15",
    labs: [
      ["Mulago National Referral Hospital Lab", "Kampala", "University hospital"],
      ["Mbarara Regional Referral Hospital Lab", "Mbarara", "Public hospital"],
      ["Gulu Regional Hospital Microbiology", "Gulu", "District hospital"],
    ],
  },
  {
    id: "bangladesh",
    name: "Bangladesh",
    region: "South Asia",
    connectivityLevel: "Moderate",
    dataSharingPolicy: "Facility sovereignty by default with approved central KPI mirror",
    programStatus: "Scaling",
    startDate: "2024-02-20",
    labs: [
      ["Dhaka Medical College Microbiology Unit", "Dhaka", "University hospital"],
      ["icddr,b Clinical Bacteriology Lab", "Dhaka", "National reference lab"],
      ["Chittagong Medical College Lab", "Chattogram", "Public hospital"],
    ],
  },
  {
    id: "nepal",
    name: "Nepal",
    region: "South Asia",
    connectivityLevel: "Low",
    dataSharingPolicy: "Offline-first local storage with monthly governed sync windows",
    programStatus: "Pilot",
    startDate: "2024-06-10",
    labs: [
      ["Tribhuvan University Teaching Hospital Lab", "Kathmandu", "University hospital"],
      ["Bir Hospital Microbiology Department", "Kathmandu", "Public hospital"],
      ["Bharatpur Central Hospital Lab", "Bharatpur", "District hospital"],
    ],
  },
] as const;

const roles: UserRole[] = ["Lab technician", "Microbiologist", "QA lead", "Program admin", "IT focal point"];
const versions = [
  { id: "v2.2.0", releaseDate: "2024-06-03", stabilityScore: 88, lisCompatibility: "OpenELIS, BLIS, MediLab" },
  { id: "v2.3.0", releaseDate: "2024-10-14", stabilityScore: 91, lisCompatibility: "OpenELIS, BLIS, MediLab, bespoke CSV bridge" },
  { id: "v2.4.0", releaseDate: "2025-03-10", stabilityScore: 84, lisCompatibility: "OpenELIS, BLIS, MediLab, DHIS2 bridge" },
  { id: "v2.5.0", releaseDate: "2025-08-04", stabilityScore: 93, lisCompatibility: "Expanded LIS mapping, local validation cache" },
  { id: "v2.5.2", releaseDate: "2026-01-19", stabilityScore: 95, lisCompatibility: "Stabilized sync queue, extended audit trail" },
] satisfies Array<Pick<VersionRelease, "id" | "releaseDate" | "stabilityScore" | "lisCompatibility">>;

const majorChanges: Record<string, string[]> = {
  "v2.2.0": ["Offline queue hardening", "New AST validation audit log"],
  "v2.3.0": ["Faster antibiogram data entry", "Expanded Gram-negative rules"],
  "v2.4.0": ["DHIS2 reporting bridge", "LIS mapping wizard"],
  "v2.5.0": ["Local validation history", "Improved sync retries"],
  "v2.5.2": ["Crash fixes on result review", "Telemetry completeness improvements"],
};

const bacteriaList = [
  "Escherichia coli",
  "Klebsiella pneumoniae",
  "Staphylococcus aureus",
  "Pseudomonas aeruginosa",
  "Acinetobacter baumannii",
  "Salmonella spp.",
  "Enterococcus faecalis",
  "Streptococcus pneumoniae",
];

const antibiotics = [
  "Ampicillin",
  "Ceftriaxone",
  "Ciprofloxacin",
  "Meropenem",
  "Gentamicin",
  "Vancomycin",
  "Piperacillin-Tazobactam",
  "Amikacin",
];

const feedbackVerbatims = [
  "Le module de saisie est trop lent quand la connexion tombe.",
  "Nous avons besoin de plus de bactéries Gram négatif dans les règles.",
  "L’import LIS fonctionne un jour sur deux depuis la mise à jour.",
  "Le logiciel aide beaucoup les nouveaux techniciens.",
  "Nous voudrions voir l’historique local des validations.",
  "La file de synchronisation reste bloquée après plusieurs sessions offline.",
  "La nouvelle version réduit vraiment le temps de validation.",
  "Le mapping LIS des antibiotiques manque encore deux codes locaux.",
  "Les superviseurs QA utilisent davantage le tableau d’audit depuis janvier.",
  "Le support WhatsApp est utile mais la réponse le week-end reste lente.",
];

const incidentTypes = [
  "sync queue stuck",
  "LIS mapping mismatch",
  "timeout on result validation",
  "duplicate AST submission",
  "delayed rollout issue",
  "incorrect interpretation rule flag",
  "telemetry gap due to offline prolonged use",
];

const owners = ["Product Ops", "QA/RA", "Field Success", "Clinical Science", "Engineering"];

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const rand = createSeededRandom(42);

function pick<T>(items: readonly T[]) {
  return items[Math.floor(rand() * items.length)];
}

function uid(prefix: string) {
  return `${prefix}_${Math.round(rand() * 1e9).toString(36)}`;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value;
}

function addMonths(date: Date, months: number) {
  const value = new Date(date);
  value.setUTCMonth(value.getUTCMonth() + months);
  return value;
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

function diffMonths(a: Date, b: Date) {
  return (a.getUTCFullYear() - b.getUTCFullYear()) * 12 + (a.getUTCMonth() - b.getUTCMonth());
}

function qualityFromConnectivity(level: ConnectivityLevel): DataQuality {
  if (level === "Strong") return pick(["Good", "Trusted"]);
  if (level === "Moderate") return pick(["Moderate", "Good", "Trusted"]);
  if (level === "Variable") return pick(["Low", "Moderate", "Good"]);
  return pick(["Low", "Moderate"]);
}

function lisFromProgram(status: ProgramStatus): LisStatus {
  if (status === "Routine use") return pick(["Partial integration", "Stable integration", "Stable integration"]);
  if (status === "Scaling") return pick(["Pilot mapping", "Partial integration", "Stable integration"]);
  return pick(["No LIS", "Pilot mapping", "Partial integration"]);
}

export function generateCountries(): Country[] {
  return countryBlueprints.map((entry) => ({
    id: entry.id,
    name: entry.name,
    region: entry.region,
    connectivityLevel: entry.connectivityLevel,
    dataSharingPolicy: entry.dataSharingPolicy,
    labCount: entry.labs.length,
    programStatus: entry.programStatus,
    startDate: entry.startDate,
  }));
}

export function generateLabs(countries: Country[]): Lab[] {
  return countryBlueprints.flatMap((entry) =>
    entry.labs.map(([name, city, type], index) => {
      const country = countries.find((item) => item.id === entry.id)!;
      const deploymentDate = addMonths(new Date(country.startDate), index);
      const currentVersion =
        diffMonths(END_DATE, deploymentDate) > 15 ? "v2.5.2" : diffMonths(END_DATE, deploymentDate) > 11 ? "v2.5.0" : "v2.4.0";
      const usersByRole = {
        "Lab technician": 3 + Math.floor(rand() * 8),
        Microbiologist: 1 + Math.floor(rand() * 3),
        "QA lead": 1,
        "Program admin": 1,
        "IT focal point": 1,
      } as Record<UserRole, number>;

      return {
        id: `${country.id}_lab_${index + 1}`,
        name,
        countryId: country.id,
        city,
        type,
        size: index === 0 ? "Large" : index === 1 ? "Medium" : "Small",
        deploymentDate: deploymentDate.toISOString(),
        currentVersion,
        lisStatus: lisFromProgram(country.programStatus),
        adoptionLevel: diffMonths(END_DATE, deploymentDate) > 12 ? "Advanced" : diffMonths(END_DATE, deploymentDate) > 7 ? "Stable" : "Emerging",
        dataQuality: qualityFromConnectivity(country.connectivityLevel),
        connectivityLevel: country.connectivityLevel,
        usersByRole,
        estimatedMonthlyLoad: 120 + Math.floor(rand() * 380),
      };
    })
  );
}

export function generateUsers(labs: Lab[]): User[] {
  const languagesByCountry: Record<string, Array<User["language"]>> = {
    senegal: ["French", "English"],
    civ: ["French"],
    cameroon: ["French", "English"],
    kenya: ["English"],
    rwanda: ["English", "French"],
    uganda: ["English"],
    bangladesh: ["English", "Bangla"],
    nepal: ["English", "Nepali"],
  };

  return labs.flatMap((lab) =>
    roles.flatMap((role) =>
      Array.from({ length: lab.usersByRole[role] }).map((_, index) => {
        const activationDate = addDays(new Date(lab.deploymentDate), 10 + index * 11);
        const lastActive = addDays(END_DATE, -Math.floor(rand() * 18));
        return {
          id: uid("user"),
          labId: lab.id,
          countryId: lab.countryId,
          role,
          activationDate: activationDate.toISOString(),
          lastActiveDate: lastActive.toISOString(),
          usageFrequency: role === "Lab technician" ? pick(["Daily", "Daily", "Weekly"]) : pick(["Weekly", "Weekly", "Occasional"]),
          language: pick(languagesByCountry[lab.countryId]),
          trainingLevel: role === "Program admin" ? "Advanced" : pick(["Basic", "Intermediate", "Advanced"]),
          primaryFeedbackChannel: pick(["Survey", "In-app", "WhatsApp", "Support ticket", "Call"]),
        };
      })
    )
  );
}

export function generateVersions(): VersionRelease[] {
  return versions.map((version) => ({
    ...version,
    majorChanges: majorChanges[version.id],
  }));
}

export function generateRollouts(countries: Country[], labs: Lab[]): VersionRollout[] {
  return labs.flatMap((lab) =>
    versions
      .filter((version) => new Date(version.releaseDate) <= END_DATE)
      .map((version, index) => ({
        versionId: version.id,
        labId: lab.id,
        countryId: lab.countryId,
        rolloutDate: addDays(addMonths(new Date(version.releaseDate), index === 0 ? 0 : 1), Math.floor(rand() * 45)).toISOString(),
      }))
  );
}

export function generateSessions(labs: Lab[], users: User[]): SessionEvent[] {
  const start = addMonths(END_DATE, -24);
  const sessions: SessionEvent[] = [];

  labs.forEach((lab, labIndex) => {
    const labUsers = users.filter((user) => user.labId === lab.id);
    const labStart = new Date(lab.deploymentDate);
    for (let day = 0; day < 730; day += 1) {
      const current = addDays(start, day);
      if (current < labStart || current > END_DATE) continue;
      const seasonality = 1 + Math.sin(day / 28) * 0.12;
      const baseline = labIndex % 2 === 0 ? 5 : 3;
      const sessionCount = Math.max(1, Math.round((baseline + rand() * 4) * seasonality));
      for (let i = 0; i < sessionCount; i += 1) {
        const user = pick(labUsers);
        const offlineBoost = lab.connectivityLevel === "Low" ? 0.58 : lab.connectivityLevel === "Variable" ? 0.33 : 0.14;
        const mode = rand() < offlineBoost ? "Offline" : "Online";
        const versionPenalty = lab.currentVersion === "v2.4.0" ? 1.18 : 1;
        const averageResponseMs = Math.round((mode === "Offline" ? 950 : 680) * versionPenalty + rand() * 280);
        const crashRateBase = lab.currentVersion === "v2.4.0" ? 0.055 : lab.currentVersion === "v2.5.2" ? 0.015 : 0.03;
        sessions.push({
          id: uid("session"),
          date: current.toISOString(),
          labId: lab.id,
          userId: user.id,
          countryId: lab.countryId,
          durationMinutes: 9 + Math.floor(rand() * 34),
          deviceType: pick(["Desktop", "Laptop", "Shared workstation", "Tablet"]),
          mode,
          syncSuccess: mode === "Offline" ? rand() > 0.17 : rand() > 0.06,
          averageResponseMs,
          crash: rand() < crashRateBase,
          keyEventCount: 3 + Math.floor(rand() * 14),
        });
      }
    }
  });

  return sessions;
}

export function generateAstRecords(labs: Lab[]): AstRecord[] {
  const start = addMonths(END_DATE, -24);
  const astRecords: AstRecord[] = [];

  labs.forEach((lab, labIndex) => {
    const deployment = new Date(lab.deploymentDate);
    for (let month = 0; month < 24; month += 1) {
      const monthDate = addMonths(start, month);
      if (monthDate < deployment || monthDate > END_DATE) continue;
      const maturity = clamp(diffMonths(monthDate, deployment) / 12, 0.25, 1.45);
      const baseVolume = (lab.estimatedMonthlyLoad * maturity) / 18;
      bacteriaList.forEach((bacteria, bacteriaIndex) => {
        const recordCount = Math.max(3, Math.round(baseVolume * (1 + (bacteriaIndex % 3) * 0.15)));
        for (let i = 0; i < recordCount; i += 1) {
          const antibiotic = antibiotics[(bacteriaIndex + i) % antibiotics.length];
          const date = addDays(monthDate, Math.floor(rand() * 28));
          const versionId =
            date >= new Date("2026-01-19") ? "v2.5.2" : date >= new Date("2025-08-04") ? "v2.5.0" : date >= new Date("2025-03-10") ? "v2.4.0" : "v2.3.0";
          const concordanceBase = versionId === "v2.4.0" ? 0.91 : versionId === "v2.5.2" ? 0.964 : 0.945;
          const concordant = rand() < concordanceBase - (lab.connectivityLevel === "Low" ? 0.018 : 0);
          const criticalError = !concordant && rand() < 0.34;
          astRecords.push({
            id: uid("ast"),
            date: date.toISOString(),
            labId: lab.id,
            countryId: lab.countryId,
            sampleType: pick(["Blood", "Urine", "Respiratory", "Wound swab", "Stool"]),
            bacteria,
            antibiotic,
            testCount: 1 + Math.floor(rand() * 5),
            softwareInterpretation: pick(["S", "I", "R"]),
            referenceInterpretation: concordant ? pick(["S", "I", "R"]) : pick(["S", "R"]),
            concordant,
            criticalError,
            requiresManualValidation: criticalError || rand() < 0.18,
            entryTimeMinutes: clamp(9 + rand() * 12 - (versionId === "v2.5.0" ? 1.2 : 0), 6, 21),
            validationTimeMinutes: clamp(6 + rand() * 13 - (versionId === "v2.5.2" ? 1.3 : 0), 4, 22),
            versionId,
          });
        }
      });
    }
  });

  return astRecords;
}

export function generateLisIntegrations(labs: Lab[]): LisIntegrationRecord[] {
  const start = addMonths(END_DATE, -24);
  return labs.flatMap((lab) =>
    Array.from({ length: 24 }).map((_, index) => {
      const month = addMonths(start, index);
      const active = month >= new Date(lab.deploymentDate);
      const successBase = lab.lisStatus === "Stable integration" ? 0.97 : lab.lisStatus === "Partial integration" ? 0.91 : lab.lisStatus === "Pilot mapping" ? 0.82 : 0.34;
      return {
        id: uid("lis"),
        labId: lab.id,
        countryId: lab.countryId,
        lisType: lab.lisStatus === "No LIS" ? "None" : pick(["OpenELIS", "BLIS", "MediLab", "Custom CSV bridge"]),
        month: monthKey(month),
        importCount: active ? 18 + Math.floor(rand() * 65) : 0,
        successRate: active ? clamp(successBase + (rand() - 0.5) * 0.08, 0.25, 0.995) : 0,
        errorCount: active ? Math.floor(rand() * 12) : 0,
        latencyMinutes: active ? Math.round(16 + rand() * 85) : 0,
        incidents: active ? Math.floor(rand() * (lab.lisStatus === "Stable integration" ? 3 : 7)) : 0,
        activationDate: lab.deploymentDate,
      };
    })
  );
}

export function generateFeedback(labs: Lab[]): FeedbackRecord[] {
  return labs.flatMap((lab, labIndex) =>
    Array.from({ length: 18 + labIndex }).map((_, index) => {
      const date = addDays(addMonths(END_DATE, -24), Math.floor(rand() * 720));
      const severity = pick(["Low", "Medium", "Medium", "High", "Critical"] as const);
      return {
        id: uid("feedback"),
        date: date.toISOString(),
        countryId: lab.countryId,
        labId: lab.id,
        channel: pick(["Survey", "In-app", "WhatsApp", "Support ticket", "Call"]),
        type: pick(["UX", "Bug", "Bacteria content", "Performance", "LIS", "Training"]),
        severity,
        status: severity === "Critical" ? pick(["Open", "In progress", "Monitoring"]) : pick(["Open", "In progress", "Monitoring", "Closed"]),
        responseHours: Math.round(4 + rand() * (severity === "Critical" ? 20 : 72)),
        nps: Math.round(18 + rand() * 52),
        csat: Math.round(2.9 + rand() * 2),
        verbatim: feedbackVerbatims[(index + labIndex) % feedbackVerbatims.length],
      };
    })
  );
}

export function generateIncidents(labs: Lab[]): IncidentRecord[] {
  return labs.flatMap((lab, labIndex) =>
    Array.from({ length: 6 + Math.floor(labIndex / 2) }).map((_, index) => {
      const date = addDays(addMonths(END_DATE, -24), Math.floor(rand() * 720));
      const severity = pick(["Medium", "High", "Critical"] as const);
      const status = pick(["Open", "In progress", "Monitoring", "Closed"] as const);
      const versionId =
        date >= new Date("2026-01-19") ? "v2.5.2" : date >= new Date("2025-08-04") ? "v2.5.0" : date >= new Date("2025-03-10") ? "v2.4.0" : "v2.3.0";
      return {
        id: uid("incident"),
        date: date.toISOString(),
        type: incidentTypes[(index + labIndex) % incidentTypes.length],
        severity,
        countryId: lab.countryId,
        labId: lab.id,
        versionId,
        triggerKpi: pick(["Crash rate", "Sync success rate", "AST precision", "LIS import success", "Data freshness"]),
        actionTaken: pick([
          "Opened CAPA and hotfix validation plan",
          "Raised site-specific training action",
          "Investigated LIS mapping and local dictionary",
          "Added monitoring threshold and follow-up review",
        ]),
        owner: owners[(index + labIndex) % owners.length],
        status,
        closedDate: status === "Closed" ? addDays(date, 10 + Math.floor(rand() * 30)).toISOString() : undefined,
      };
    })
  );
}

export function generateDashboardData(): DashboardData {
  const countries = generateCountries();
  const labs = generateLabs(countries);
  const users = generateUsers(labs);
  const versionsData = generateVersions();
  const rollouts = generateRollouts(countries, labs);
  const sessions = generateSessions(labs, users);
  const astRecords = generateAstRecords(labs);
  const lisIntegrations = generateLisIntegrations(labs);
  const feedback = generateFeedback(labs);
  const incidents = generateIncidents(labs);

  return {
    generatedAt: END_DATE.toISOString(),
    countries,
    labs,
    users,
    versions: versionsData,
    rollouts,
    sessions,
    astRecords,
    lisIntegrations,
    feedback,
    incidents,
  };
}

export const mockDashboardData = generateDashboardData();
export const bacteriaOptions = bacteriaList;
export const antibioticOptions = antibiotics;
