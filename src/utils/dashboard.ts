import { antibioticOptions, bacteriaOptions } from "../data/mockData";
import {
  type AstRecord,
  type DashboardData,
  type FeedbackRecord,
  type GlobalFiltersState,
  type IncidentRecord,
  type Lab,
  type LisIntegrationRecord,
  type SessionEvent,
} from "../types";

export const defaultFilters: GlobalFiltersState = {
  periodMonths: 6,
  countryIds: [],
  regions: [],
  labIds: [],
  labTypes: [],
  versionIds: [],
  lisStatuses: [],
  usageModes: [],
  connectivityLevels: [],
  userRoles: [],
  bacteria: [],
  antibiotics: [],
  feedbackTypes: [],
  incidentSeverities: [],
  capaStatuses: [],
};

function lastMonths(dateIso: string, periodMonths: number) {
  const date = new Date(dateIso);
  const since = new Date(date);
  since.setUTCMonth(since.getUTCMonth() - periodMonths);
  return since;
}

function matchesArray<T>(value: T, selected: T[]) {
  return !selected.length || selected.includes(value);
}

export function getFilterMeta(data: DashboardData) {
  return {
    countries: data.countries,
    labs: data.labs,
    versions: data.versions,
    bacteria: bacteriaOptions,
    antibiotics: antibioticOptions,
  };
}

export function filterData(data: DashboardData, filters: GlobalFiltersState) {
  const since = lastMonths(data.generatedAt, filters.periodMonths);
  const filteredLabs = data.labs.filter((lab) => {
    const country = data.countries.find((item) => item.id === lab.countryId)!;
    return (
      matchesArray(lab.countryId, filters.countryIds) &&
      matchesArray(country.region, filters.regions) &&
      matchesArray(lab.id, filters.labIds) &&
      matchesArray(lab.type, filters.labTypes) &&
      matchesArray(lab.currentVersion, filters.versionIds) &&
      matchesArray(lab.lisStatus, filters.lisStatuses) &&
      matchesArray(lab.connectivityLevel, filters.connectivityLevels)
    );
  });
  const allowedLabIds = new Set(filteredLabs.map((lab) => lab.id));
  const allowedCountryIds = new Set(filteredLabs.map((lab) => lab.countryId));

  const sessions = data.sessions.filter(
    (session) =>
      allowedLabIds.has(session.labId) &&
      new Date(session.date) >= since &&
      matchesArray(session.mode, filters.usageModes)
  );
  const astRecords = data.astRecords.filter(
    (record) =>
      allowedLabIds.has(record.labId) &&
      new Date(record.date) >= since &&
      matchesArray(record.versionId, filters.versionIds) &&
      matchesArray(record.bacteria, filters.bacteria) &&
      matchesArray(record.antibiotic, filters.antibiotics)
  );
  const lisIntegrations = data.lisIntegrations.filter(
    (record) => allowedLabIds.has(record.labId) && new Date(`${record.month}-01`) >= since
  );
  const feedback = data.feedback.filter(
    (item) =>
      allowedLabIds.has(item.labId) &&
      new Date(item.date) >= since &&
      matchesArray(item.type, filters.feedbackTypes) &&
      matchesArray(item.severity, filters.incidentSeverities) &&
      matchesArray(item.status, filters.capaStatuses)
  );
  const incidents = data.incidents.filter(
    (item) =>
      allowedLabIds.has(item.labId) &&
      new Date(item.date) >= since &&
      matchesArray(item.severity, filters.incidentSeverities) &&
      matchesArray(item.status, filters.capaStatuses) &&
      matchesArray(item.versionId, filters.versionIds)
  );
  const users = data.users.filter(
    (user) => allowedLabIds.has(user.labId) && matchesArray(user.role, filters.userRoles)
  );

  return {
    countries: data.countries.filter((country) => allowedCountryIds.has(country.id)),
    labs: filteredLabs,
    users,
    versions: data.versions,
    sessions,
    astRecords,
    lisIntegrations,
    feedback,
    incidents,
  };
}

function monthLabel(dateIso: string) {
  const date = new Date(dateIso);
  return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function aggregateByMonth<T>(items: T[], getDate: (item: T) => string) {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const key = getDate(item).slice(0, 7);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  });
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

const avg = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

function previousPeriodSessions(sessions: SessionEvent[], generatedAt: string, periodMonths: number) {
  const end = new Date(generatedAt);
  const currentSince = new Date(end);
  currentSince.setUTCMonth(currentSince.getUTCMonth() - periodMonths);
  const previousSince = new Date(currentSince);
  previousSince.setUTCMonth(previousSince.getUTCMonth() - periodMonths);
  return {
    current: sessions.filter((item) => new Date(item.date) >= currentSince),
    previous: sessions.filter((item) => {
      const date = new Date(item.date);
      return date >= previousSince && date < currentSince;
    }),
  };
}

function previousPeriodAst(astRecords: AstRecord[], generatedAt: string, periodMonths: number) {
  const end = new Date(generatedAt);
  const currentSince = new Date(end);
  currentSince.setUTCMonth(currentSince.getUTCMonth() - periodMonths);
  const previousSince = new Date(currentSince);
  previousSince.setUTCMonth(previousSince.getUTCMonth() - periodMonths);
  return {
    current: astRecords.filter((item) => new Date(item.date) >= currentSince),
    previous: astRecords.filter((item) => {
      const date = new Date(item.date);
      return date >= previousSince && date < currentSince;
    }),
  };
}

function delta(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function getOverviewMetrics(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  const sessionPeriods = previousPeriodSessions(data.sessions, data.generatedAt, filters.periodMonths);
  const astPeriods = previousPeriodAst(data.astRecords, data.generatedAt, filters.periodMonths);
  const filteredSessionPeriods = {
    current: filterData({ ...data, sessions: sessionPeriods.current }, filters).sessions,
    previous: filterData({ ...data, sessions: sessionPeriods.previous }, { ...filters, periodMonths: filters.periodMonths * 2 }).sessions,
  };
  const filteredAstPeriods = {
    current: filterData({ ...data, astRecords: astPeriods.current }, filters).astRecords,
    previous: filterData({ ...data, astRecords: astPeriods.previous }, { ...filters, periodMonths: filters.periodMonths * 2 }).astRecords,
  };

  const activeLabs = new Set(filtered.sessions.map((item) => item.labId)).size;
  const activeMonthlyUsers = new Set(filtered.sessions.slice(-900).map((item) => item.userId)).size;
  const astVolume = filtered.astRecords.reduce((sum, item) => sum + item.testCount, 0);
  const astPrecision = avg(filtered.astRecords.map((item) => (item.concordant ? 100 : 0)));
  const vme = avg(filtered.astRecords.map((item) => (item.criticalError ? 100 : 0)));
  const crashRate = avg(filtered.sessions.map((item) => (item.crash ? 100 : 0)));
  const syncSuccessRate = avg(filtered.sessions.map((item) => (item.syncSuccess ? 100 : 0)));
  const entryTime = avg(filtered.astRecords.map((item) => item.entryTimeMinutes));
  const lisAdoption = avg(filtered.lisIntegrations.filter((item) => item.importCount > 0).map((item) => item.successRate * 100));
  const feedbackResponse = avg(filtered.feedback.map((item) => (item.responseHours <= 48 ? 100 : 0)));

  return [
    {
      key: "activeLabs",
      label: "Active labs",
      value: activeLabs.toString(),
      delta: delta(
        activeLabs,
        new Set(filteredSessionPeriods.previous.map((item) => item.labId)).size
      ),
      tone: activeLabs >= 18 ? "green" : "orange",
      description: "Labs with at least one active session in the selected window.",
      formula: "Distinct lab_id in session telemetry.",
      threshold: "Review below 12 active labs.",
      action: "Investigate rollout blockers and local support coverage.",
    },
    {
      key: "mau",
      label: "Monthly active users",
      value: activeMonthlyUsers.toString(),
      delta: delta(
        activeMonthlyUsers,
        new Set(filteredSessionPeriods.previous.slice(-900).map((item) => item.userId)).size
      ),
      tone: "teal",
      description: "Distinct users active in recent telemetry, across roles.",
      formula: "Distinct user_id over latest 30 days of filtered sessions.",
      threshold: "Review if role mix becomes too technician-heavy.",
      action: "Target refresher training for QA and microbiologist roles.",
    },
    {
      key: "astVolume",
      label: "AST monthly volume",
      value: astVolume.toLocaleString(),
      delta: delta(
        filteredAstPeriods.current.reduce((sum, item) => sum + item.testCount, 0),
        filteredAstPeriods.previous.reduce((sum, item) => sum + item.testCount, 0)
      ),
      tone: "blue",
      description: "Total AST tests handled in the selected period.",
      formula: "Sum(test_count) across AST records.",
      threshold: "Review sharp drops >15% after rollout.",
      action: "Check site activity, staffing, and LIS feed continuity.",
    },
    {
      key: "precision",
      label: "AST precision",
      value: `${astPrecision.toFixed(1)}%`,
      delta: delta(
        avg(filteredAstPeriods.current.map((item) => (item.concordant ? 100 : 0))),
        avg(filteredAstPeriods.previous.map((item) => (item.concordant ? 100 : 0)))
      ),
      tone: astPrecision >= 95 ? "green" : "orange",
      description: "Concordance between software interpretation and reference interpretation.",
      formula: "Concordant AST records / total AST records.",
      threshold: "Alert below 94%.",
      action: "Review species-level drift and validation overrides.",
    },
    {
      key: "vme",
      label: "Very major error rate",
      value: `${vme.toFixed(2)}%`,
      delta: delta(
        avg(filteredAstPeriods.current.map((item) => (item.criticalError ? 100 : 0))),
        avg(filteredAstPeriods.previous.map((item) => (item.criticalError ? 100 : 0)))
      ),
      tone: vme < 2 ? "green" : "red",
      description: "Critical AST interpretation mismatches with potential clinical risk.",
      formula: "Critical errors / total AST records.",
      threshold: "Alert above 2%.",
      action: "Escalate to clinical science and QA/RA review.",
    },
    {
      key: "crash",
      label: "Crash rate",
      value: `${crashRate.toFixed(2)}%`,
      delta: delta(
        avg(filteredSessionPeriods.current.map((item) => (item.crash ? 100 : 0))),
        avg(filteredSessionPeriods.previous.map((item) => (item.crash ? 100 : 0)))
      ),
      tone: crashRate < 3 ? "green" : "red",
      description: "Share of sessions ending in application crash.",
      formula: "Crash sessions / total sessions.",
      threshold: "Alert above 3%.",
      action: "Correlate with version, device type, and connectivity mode.",
    },
    {
      key: "sync",
      label: "Sync success",
      value: `${syncSuccessRate.toFixed(1)}%`,
      delta: delta(
        avg(filteredSessionPeriods.current.map((item) => (item.syncSuccess ? 100 : 0))),
        avg(filteredSessionPeriods.previous.map((item) => (item.syncSuccess ? 100 : 0)))
      ),
      tone: syncSuccessRate >= 90 ? "green" : "orange",
      description: "Successful remote sync completion across online and deferred uploads.",
      formula: "Successful sync events / total sync attempts.",
      threshold: "Review below 85%.",
      action: "Inspect offline queue, network windows, and retry logic.",
    },
    {
      key: "entry",
      label: "Average entry time",
      value: `${entryTime.toFixed(1)} min`,
      delta: delta(
        avg(filteredAstPeriods.current.map((item) => item.entryTimeMinutes)),
        avg(filteredAstPeriods.previous.map((item) => item.entryTimeMinutes))
      ) * -1,
      tone: entryTime <= 12 ? "green" : "orange",
      description: "Average manual entry time per AST record.",
      formula: "Mean(entry_time_minutes).",
      threshold: "Review above 13 min.",
      action: "Investigate UX friction, training gaps, or performance latency.",
    },
    {
      key: "lis",
      label: "LIS adoption health",
      value: `${lisAdoption.toFixed(1)}%`,
      delta: 3.6,
      tone: lisAdoption >= 88 ? "green" : "orange",
      description: "Success-weighted proxy for active LIS integration maturity.",
      formula: "Average monthly LIS success_rate where imports > 0.",
      threshold: "Review below 85%.",
      action: "Prioritize mapping fixes on partial or pilot integrations.",
    },
    {
      key: "feedback",
      label: "Feedback response rate",
      value: `${feedbackResponse.toFixed(1)}%`,
      delta: delta(
        avg(filtered.feedback.map((item) => (item.responseHours <= 48 ? 100 : 0))),
        72
      ),
      tone: feedbackResponse >= 80 ? "green" : "orange",
      description: "Share of field feedback answered within 48 hours.",
      formula: "Feedback records with response_hours <= 48 / total feedback.",
      threshold: "Review below 75%.",
      action: "Rebalance support ownership and SLA coverage.",
    },
  ];
}

export function getTimeSeries(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  const astByMonth = aggregateByMonth(filtered.astRecords, (item) => item.date);
  const sessionByMonth = aggregateByMonth(filtered.sessions, (item) => item.date);
  const lisByMonth = aggregateByMonth(filtered.lisIntegrations, (item) => `${item.month}-01`);

  return astByMonth.map(([month, records], index) => {
    const monthSessions = sessionByMonth.find(([key]) => key === month)?.[1] ?? [];
    const monthLis = lisByMonth.find(([key]) => key === month)?.[1] ?? [];
    return {
      month,
      label: monthLabel(`${month}-01`),
      astVolume: records.reduce((sum, item) => sum + item.testCount, 0),
      astPrecision: avg(records.map((item) => (item.concordant ? 100 : 0))),
      vme: avg(records.map((item) => (item.criticalError ? 100 : 0))),
      crashRate: avg(monthSessions.map((item) => (item.crash ? 100 : 0))),
      avgEntryTime: avg(records.map((item) => item.entryTimeMinutes)),
      syncSuccess: avg(monthSessions.map((item) => (item.syncSuccess ? 100 : 0))),
      offlineShare: avg(monthSessions.map((item) => (item.mode === "Offline" ? 100 : 0))),
      lisAdoption: avg(monthLis.map((item) => item.successRate * 100)),
      responseMs: avg(monthSessions.map((item) => item.averageResponseMs)),
      annotation:
        index > 0 && avg(records.map((item) => (item.criticalError ? 100 : 0))) > 2
          ? "Clinical review"
          : "",
    };
  });
}

export function getGeoRows(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  return filtered.countries.map((country) => {
    const labs = filtered.labs.filter((lab) => lab.countryId === country.id);
    const ast = filtered.astRecords.filter((item) => item.countryId === country.id);
    const sessions = filtered.sessions.filter((item) => item.countryId === country.id);
    const incidents = filtered.incidents.filter((item) => item.countryId === country.id);
    const dataQualityScore = avg(labs.map((lab) => ({ Low: 52, Moderate: 68, Good: 84, Trusted: 94 }[lab.dataQuality])));
    return {
      id: country.id,
      country: country.name,
      region: country.region,
      activeLabs: labs.length,
      astPrecision: avg(ast.map((item) => (item.concordant ? 100 : 0))),
      incidents: incidents.filter((item) => item.status !== "Closed").length,
      syncSuccess: avg(sessions.map((item) => (item.syncSuccess ? 100 : 0))),
      connectivity: country.connectivityLevel,
      dataQualityScore,
      risk:
        incidents.length > 8 || avg(ast.map((item) => (item.criticalError ? 100 : 0))) > 2
          ? "Elevated"
          : dataQualityScore < 75
            ? "Watch"
            : "Healthy",
    };
  });
}

export function getLabRows(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  return filtered.labs.map((lab) => {
    const country = data.countries.find((item) => item.id === lab.countryId)!;
    const sessions = filtered.sessions.filter((item) => item.labId === lab.id);
    const ast = filtered.astRecords.filter((item) => item.labId === lab.id);
    const lis = filtered.lisIntegrations.filter((item) => item.labId === lab.id);
    const lastFeedback = filtered.feedback
      .filter((item) => item.labId === lab.id)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    const riskScore =
      avg(ast.map((item) => (item.criticalError ? 100 : 0))) * 10 +
      avg(sessions.map((item) => (item.crash ? 100 : 0))) * 7 +
      (100 - avg(sessions.map((item) => (item.syncSuccess ? 100 : 0)))) * 0.6;

    return {
      id: lab.id,
      lab: lab.name,
      country: country.name,
      deploymentDate: lab.deploymentDate.slice(0, 10),
      version: lab.currentVersion,
      activeUsers: new Set(sessions.map((item) => item.userId)).size,
      astPerMonth: Math.round(ast.reduce((sum, item) => sum + item.testCount, 0) / Math.max(filters.periodMonths, 1)),
      astPrecision: avg(ast.map((item) => (item.concordant ? 100 : 0))),
      crashRate: avg(sessions.map((item) => (item.crash ? 100 : 0))),
      syncSuccess: avg(sessions.map((item) => (item.syncSuccess ? 100 : 0))),
      lisStatus: lab.lisStatus,
      dataQuality: lab.dataQuality,
      latestFeedback: lastFeedback?.verbatim ?? "No recent feedback",
      riskLevel: riskScore > 35 ? "High" : riskScore > 20 ? "Medium" : "Low",
      riskScore: Math.round(riskScore),
    };
  });
}

export function getFeedbackRows(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  return filtered.feedback
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) => {
      const country = data.countries.find((countryItem) => countryItem.id === item.countryId)!;
      const lab = data.labs.find((labItem) => labItem.id === item.labId)!;
      return {
        id: item.id,
        date: item.date.slice(0, 10),
        country: country.name,
        lab: lab.name,
        channel: item.channel,
        type: item.type,
        severity: item.severity,
        status: item.status,
        responseHours: item.responseHours,
        nps: item.nps,
        csat: item.csat,
        verbatim: item.verbatim,
      };
    });
}

export function getIncidentRows(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  return filtered.incidents
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) => {
      const country = data.countries.find((countryItem) => countryItem.id === item.countryId)!;
      const lab = data.labs.find((labItem) => labItem.id === item.labId)!;
      return {
        id: item.id,
        date: item.date.slice(0, 10),
        version: item.versionId,
        type: item.type,
        country: country.name,
        lab: lab.name,
        triggerKpi: item.triggerKpi,
        severity: item.severity,
        owner: item.owner,
        actionTaken: item.actionTaken,
        status: item.status,
      };
    });
}

export function getClinicalRows(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  const map = new Map<
    string,
    {
      bacteria: string;
      records: AstRecord[];
    }
  >();
  filtered.astRecords.forEach((record) => {
    const bucket = map.get(record.bacteria) ?? { bacteria: record.bacteria, records: [] };
    bucket.records.push(record);
    map.set(record.bacteria, bucket);
  });
  return Array.from(map.values()).map(({ bacteria, records }) => ({
    bacteria,
    volume: records.reduce((sum, item) => sum + item.testCount, 0),
    precision: avg(records.map((item) => (item.concordant ? 100 : 0))),
    criticalErrors: avg(records.map((item) => (item.criticalError ? 100 : 0))),
    manualValidation: avg(records.map((item) => (item.requiresManualValidation ? 100 : 0))),
    topAntibiotic:
      Object.entries(
        records.reduce<Record<string, number>>((acc, item) => {
          acc[item.antibiotic] = (acc[item.antibiotic] ?? 0) + item.testCount;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A",
  }));
}

export function getRoleDistribution(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  return ["Lab technician", "Microbiologist", "QA lead", "Program admin", "IT focal point"].map((role) => ({
    role,
    users: filtered.users.filter((user) => user.role === role).length,
  }));
}

export function getVersionDistribution(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  return data.versions.map((version) => ({
    version: version.id,
    labs: filtered.labs.filter((lab) => lab.currentVersion === version.id).length,
    incidents: filtered.incidents.filter((item) => item.versionId === version.id).length,
    precision: avg(filtered.astRecords.filter((item) => item.versionId === version.id).map((item) => (item.concordant ? 100 : 0))),
  }));
}

export function getActionItems(data: DashboardData, filters: GlobalFiltersState) {
  const filtered = filterData(data, filters);
  const labRows = getLabRows(data, filters).sort((a, b) => b.riskScore - a.riskScore);
  const versionRows = getVersionDistribution(data, filters);
  const clinicalRows = getClinicalRows(data, filters).sort((a, b) => b.criticalErrors - a.criticalErrors);
  const lisAtRisk = filtered.lisIntegrations.filter((item) => item.importCount > 0 && item.successRate < 0.85);

  return [
    {
      title: `Crash rate above threshold on ${versionRows.find((item) => item.version === "v2.4.0")?.version ?? "v2.4.0"}`,
      priority: "High",
      rationale: "v2.4.0 still concentrates a disproportionate share of incidents in Kenya and Cameroon.",
      owner: "Engineering",
      nextStep: "Accelerate remaining sites to v2.5.2 and review workstation-specific crash traces.",
      reviewDate: "2026-04-15",
    },
    {
      title: `AST precision drift on ${clinicalRows[0]?.bacteria ?? "Klebsiella pneumoniae"}`,
      priority: clinicalRows[0]?.criticalErrors > 2 ? "High" : "Medium",
      rationale: "Species-level concordance worsened after expanded rules and now drives manual validation load.",
      owner: "Clinical Science",
      nextStep: "Audit reference cases and compare rule pack changes by version.",
      reviewDate: "2026-04-18",
    },
    {
      title: `${lisAtRisk.length} monthly LIS snapshots below 85% success`,
      priority: lisAtRisk.length > 6 ? "High" : "Medium",
      rationale: "Partial integrations remain unstable on sites with bespoke CSV bridges and variable connectivity.",
      owner: "Field Success",
      nextStep: "Prioritize mapping review and local retry policy checks on affected sites.",
      reviewDate: "2026-04-12",
    },
    {
      title: `${labRows.filter((row) => row.riskLevel === "High").length} labs with elevated operational risk`,
      priority: "Medium",
      rationale: "Risk score combines clinical error, crash rate, and sync fragility.",
      owner: "Product Ops",
      nextStep: "Run country-level review with top-risk labs and CAPA status.",
      reviewDate: "2026-04-22",
    },
  ];
}

export function countActiveFilters(filters: GlobalFiltersState) {
  return Object.entries(filters).reduce((sum, [, value]) => {
    if (Array.isArray(value)) return sum + (value.length ? 1 : 0);
    if (typeof value === "number") return sum + (value !== defaultFilters.periodMonths ? 1 : 0);
    return sum;
  }, 0);
}
