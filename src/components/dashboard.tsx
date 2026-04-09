import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  HStack,
  Icon,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  SimpleGrid,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { InfoOutlineIcon, DownloadIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  FiActivity,
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiFlag,
  FiGlobe,
  FiLayers,
  FiUsers,
} from "react-icons/fi";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { exportRowsToCsv } from "../utils/csv";
import { antibioticOptions, bacteriaOptions } from "../data/mockData";
import { useLocale } from "../i18n";
import {
  countActiveFilters,
  defaultFilters,
  getActionItems,
  getClinicalRows,
  getFeedbackRows,
  getFilterMeta,
  getGeoRows,
  getIncidentRows,
  getLabRows,
  getOverviewMetrics,
  getRoleDistribution,
  getTimeSeries,
  getVersionDistribution,
} from "../utils/dashboard";
import { type DashboardData, type GlobalFiltersState } from "../types";

export function InfoPopover({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <IconButton aria-label={title} size="sm" variant="ghost" icon={<InfoOutlineIcon />} />
      </PopoverTrigger>
      <PopoverContent borderRadius="4px" borderColor="blackAlpha.200">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="700">{title}</PopoverHeader>
        <PopoverBody color="slate.700">{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export function CSVExportButton({
  filename,
  rows,
}: {
  filename: string;
  rows: Record<string, unknown>[];
}) {
  const { t } = useLocale();
  return (
    <Button
      leftIcon={<DownloadIcon />}
      size="sm"
      variant="outline"
      onClick={() => exportRowsToCsv(filename, rows)}
    >
      {t("exportCsv")}
    </Button>
  );
}

function deltaColor(delta: number) {
  if (delta > 3) return "green";
  if (delta < -3) return "red";
  return "gray";
}

function toneBg(tone: string) {
  return {
    green: "#f7faf7",
    red: "#fff4f3",
    teal: "#f6f6f4",
    blue: "#f5f8fc",
    orange: "#fff8f1",
  }[tone] ?? "white";
}

function toneColor(tone: string) {
  return {
    green: "green.600",
    red: "msf.600",
    teal: "slate.700",
    blue: "blue.600",
    orange: "orange.600",
  }[tone] ?? "slate.700";
}

const kpiIcons = [FiGlobe, FiUsers, FiLayers, FiCheckCircle, FiAlertCircle, FiActivity, FiDatabase, FiClock, FiBarChart2, FiFlag];

export function KPICard({
  item,
  index,
}: {
  item: ReturnType<typeof getOverviewMetrics>[number];
  index: number;
}) {
  const { t } = useLocale();
  const KpiIcon = kpiIcons[index % kpiIcons.length];
  return (
    <Card bg={toneBg(item.tone)} border="1px solid" borderColor="white">
      <CardBody>
        <Stat>
          <Flex justify="space-between" align="start" mb={4}>
            <Box>
              <StatLabel color="slate.700" fontSize="sm">
                {item.label}
              </StatLabel>
              <StatNumber fontSize="3xl" mt={2}>
                {item.value}
              </StatNumber>
            </Box>
            <HStack spacing={1}>
              <Flex
                bg="white"
                borderRadius="4px"
                p={2}
                align="center"
                justify="center"
                color={toneColor(item.tone)}
              >
                <Icon as={KpiIcon} boxSize={5} />
              </Flex>
              <InfoPopover title={t("kpiRead", { label: item.label })}>
                <Stack spacing={3} fontSize="sm">
                  <Text><strong>{t("definition")}:</strong> {item.description}</Text>
                  <Text><strong>{t("formula")}:</strong> {item.formula}</Text>
                  <Text><strong>{t("whyItMatters")}:</strong> {t("whyItMattersBody")}</Text>
                  <Text><strong>{t("threshold")}:</strong> {item.threshold}</Text>
                  <Text><strong>{t("suggestedAction")}:</strong> {item.action}</Text>
                </Stack>
              </InfoPopover>
            </HStack>
          </Flex>
          <StatHelpText mb={0} color={`${deltaColor(item.delta)}.600`}>
            {item.delta >= 0 ? "+" : ""}
            {item.delta.toFixed(1)}% {t("vsPreviousPeriod")}
          </StatHelpText>
          <Badge mt={3} colorScheme={item.delta >= 0 ? "green" : "red"} borderRadius="4px" px={3} py={1}>
            {item.delta >= 0 ? t("trendingBetter") : t("needsAttention")}
          </Badge>
        </Stat>
      </CardBody>
    </Card>
  );
}

export function KPIGrid({ data, filters }: { data: DashboardData; filters: GlobalFiltersState }) {
  const metrics = useMemo(() => getOverviewMetrics(data, filters), [data, filters]);
  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3, "2xl": 5 }} spacing={4}>
      {metrics.map((item, index) => (
        <KPICard key={item.key} item={item} index={index} />
      ))}
    </SimpleGrid>
  );
}

function FilterChecklist({
  label,
  helper,
  options,
  value,
  onChange,
}: {
  label: string;
  helper?: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <FormControl>
      <FormLabel fontSize="sm" mb={2}>
        {label}
      </FormLabel>
      {helper ? <FormHelperText mt={0} mb={2}>{helper}</FormHelperText> : null}
      <CheckboxGroup value={value} onChange={(next) => onChange(next as string[])}>
        <Stack spacing={2} maxH="160px" overflowY="auto">
          {options.map((option) => (
            <Checkbox key={option} value={option}>
              {option}
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
    </FormControl>
  );
}

export function GlobalFilters({
  data,
  filters,
  setFilters,
}: {
  data: DashboardData;
  filters: GlobalFiltersState;
  setFilters: Dispatch<SetStateAction<GlobalFiltersState>>;
}) {
  const { t } = useLocale();
  const meta = useMemo(() => getFilterMeta(data), [data]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const activeCount = countActiveFilters(filters);

  const activeChips = [
    ...filters.countryIds.map((item) => ({ key: item, label: meta.countries.find((country) => country.id === item)?.name ?? item })),
    ...filters.versionIds.map((item) => ({ key: item, label: item })),
    ...filters.labTypes.map((item) => ({ key: item, label: item })),
    ...filters.bacteria.map((item) => ({ key: item, label: item })),
    ...filters.feedbackTypes.map((item) => ({ key: item, label: item })),
  ];

  return (
    <Card bg="white">
      <CardBody>
        <Stack spacing={4}>
          <Flex
            justify="space-between"
            align={{ base: "stretch", xl: "end" }}
            direction={{ base: "column", xl: "row" }}
            gap={4}
          >
            <Flex
              flex="1"
              gap={3}
              align="end"
              wrap={{ base: "wrap", xl: "nowrap" }}
              minW={0}
            >
              <FormControl flex={{ base: "1 1 180px", xl: "0 0 170px" }} minW={0}>
                <FormLabel fontSize="sm">{t("relativePeriod")}</FormLabel>
                <Select
                  value={filters.periodMonths}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, periodMonths: Number(event.target.value) }))
                  }
                >
                  <option value={3}>{t("last3Months")}</option>
                  <option value={6}>{t("last6Months")}</option>
                  <option value={12}>{t("last12Months")}</option>
                  <option value={24}>{t("last24Months")}</option>
                </Select>
              </FormControl>
              <FormControl flex={{ base: "1 1 220px", xl: "0 0 220px" }} minW={0}>
                <FormLabel fontSize="sm">{t("countryFocus")}</FormLabel>
                <Select
                  value={filters.countryIds[0] ?? ""}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      countryIds: event.target.value ? [event.target.value] : [],
                    }))
                  }
                >
                  <option value="">{t("allCountries")}</option>
                  {meta.countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl flex={{ base: "1 1 220px", xl: "0 0 220px" }} minW={0}>
                <FormLabel fontSize="sm">{t("versionFocus")}</FormLabel>
                <Select
                  value={filters.versionIds[0] ?? ""}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      versionIds: event.target.value ? [event.target.value] : [],
                    }))
                  }
                >
                  <option value="">{t("allVersions")}</option>
                  {meta.versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.id}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Box pt={{ base: 0, xl: 0 }} flex={{ base: "0 0 auto", xl: "0 0 auto" }}>
                <InfoPopover title={t("aboutFilters")}>
                  <Stack spacing={3} fontSize="sm">
                    <Text><strong>{t("version")}:</strong> {t("versionHelp")}</Text>
                    <Text><strong>{t("connectivity")}:</strong> {t("connectivityHelp")}</Text>
                    <Text><strong>{t("clinicalQuality")}:</strong> {t("clinicalHelp")}</Text>
                  </Stack>
                </InfoPopover>
              </Box>
            </Flex>
            <Flex
              gap={3}
              align="center"
              justify={{ base: "space-between", xl: "flex-end" }}
              wrap={{ base: "wrap", xl: "nowrap" }}
            >
              <Badge colorScheme={activeCount ? "teal" : "gray"} borderRadius="4px" px={3} py={1}>
                {t("activeFilters", { count: activeCount })}
              </Badge>
              <Button leftIcon={<SettingsIcon />} onClick={onOpen}>
                {t("advancedFilters")}
              </Button>
              <Button variant="ghost" onClick={() => setFilters(defaultFilters)}>
                {t("reset")}
              </Button>
            </Flex>
          </Flex>
          <HStack spacing={2} flexWrap="wrap">
            {activeChips.length ? (
              activeChips.slice(0, 10).map((chip) => (
                <Badge key={chip.key} bg="gray.100" color="gray.800" borderRadius="4px" px={3} py={1}>
                  {chip.label}
                </Badge>
              ))
            ) : (
              <Text fontSize="sm" color="slate.600">
                {t("noAdvancedFilters")}
              </Text>
            )}
          </HStack>
        </Stack>
      </CardBody>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t("advancedGlobalFilters")}</DrawerHeader>
          <DrawerBody>
            <Stack spacing={6}>
              <FilterChecklist
                label={t("regions")}
                options={[...new Set(meta.countries.map((item) => item.region))]}
                value={filters.regions}
                onChange={(next) => setFilters((current) => ({ ...current, regions: next as GlobalFiltersState["regions"] }))}
              />
              <FilterChecklist
                label={t("laboratories")}
                options={meta.labs.map((item) => item.name)}
                value={meta.labs.filter((item) => filters.labIds.includes(item.id)).map((item) => item.name)}
                onChange={(names) =>
                  setFilters((current) => ({
                    ...current,
                    labIds: meta.labs.filter((item) => names.includes(item.name)).map((item) => item.id),
                  }))
                }
              />
              <FilterChecklist
                label={t("labType")}
                options={[...new Set(meta.labs.map((item) => item.type))]}
                value={filters.labTypes}
                onChange={(next) => setFilters((current) => ({ ...current, labTypes: next as GlobalFiltersState["labTypes"] }))}
              />
              <FilterChecklist
                label={t("lisStatus")}
                helper={t("lisStatusHelp")}
                options={[...new Set(meta.labs.map((item) => item.lisStatus))]}
                value={filters.lisStatuses}
                onChange={(next) => setFilters((current) => ({ ...current, lisStatuses: next as GlobalFiltersState["lisStatuses"] }))}
              />
              <FilterChecklist
                label={t("connectivity")}
                helper={t("connectivityDrawerHelp")}
                options={[...new Set(meta.labs.map((item) => item.connectivityLevel))]}
                value={filters.connectivityLevels}
                onChange={(next) => setFilters((current) => ({ ...current, connectivityLevels: next as GlobalFiltersState["connectivityLevels"] }))}
              />
              <FilterChecklist
                label={t("usageMode")}
                options={["Online", "Offline"]}
                value={filters.usageModes}
                onChange={(next) => setFilters((current) => ({ ...current, usageModes: next as GlobalFiltersState["usageModes"] }))}
              />
              <FilterChecklist
                label={t("userRole")}
                options={["Lab technician", "Microbiologist", "QA lead", "Program admin", "IT focal point"]}
                value={filters.userRoles}
                onChange={(next) => setFilters((current) => ({ ...current, userRoles: next as GlobalFiltersState["userRoles"] }))}
              />
              <FilterChecklist
                label={t("bacteria")}
                helper={t("bacteriaHelp")}
                options={bacteriaOptions}
                value={filters.bacteria}
                onChange={(next) => setFilters((current) => ({ ...current, bacteria: next }))}
              />
              <FilterChecklist
                label={t("antibiotic")}
                options={antibioticOptions}
                value={filters.antibiotics}
                onChange={(next) => setFilters((current) => ({ ...current, antibiotics: next }))}
              />
              <FilterChecklist
                label={t("feedbackType")}
                options={["UX", "Bug", "Bacteria content", "Performance", "LIS", "Training"]}
                value={filters.feedbackTypes}
                onChange={(next) => setFilters((current) => ({ ...current, feedbackTypes: next as GlobalFiltersState["feedbackTypes"] }))}
              />
              <FilterChecklist
                label={t("incidentSeverity")}
                options={["Low", "Medium", "High", "Critical"]}
                value={filters.incidentSeverities}
                onChange={(next) => setFilters((current) => ({ ...current, incidentSeverities: next as GlobalFiltersState["incidentSeverities"] }))}
              />
              <FilterChecklist
                label={t("capaStatus")}
                options={["Open", "In progress", "Monitoring", "Closed"]}
                value={filters.capaStatuses}
                onChange={(next) => setFilters((current) => ({ ...current, capaStatuses: next as GlobalFiltersState["capaStatuses"] }))}
              />
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}

export function TimeSeriesPanel({ data, filters }: { data: DashboardData; filters: GlobalFiltersState }) {
  const { t } = useLocale();
  const series = useMemo(() => getTimeSeries(data, filters), [data, filters]);
  const roleData = useMemo(() => getRoleDistribution(data, filters), [data, filters]);
  const [metric, setMetric] = useState<"astVolume" | "astPrecision" | "crashRate" | "avgEntryTime" | "syncSuccess">("astVolume");

  return (
    <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={4}>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <Box>
              <Text fontWeight="700">{t("temporalSignals")}</Text>
              <Text fontSize="sm" color="slate.600">{t("temporalSignalsSubtitle")}</Text>
            </Box>
            <Select maxW="230px" value={metric} onChange={(e) => setMetric(e.target.value as typeof metric)}>
              <option value="astVolume">{t("astVolume")}</option>
              <option value="astPrecision">{t("astPrecision")}</option>
              <option value="crashRate">{t("crashRate")}</option>
              <option value="avgEntryTime">{t("entryTime")}</option>
              <option value="syncSuccess">{t("syncSuccess")}</option>
            </Select>
          </Flex>
        </CardHeader>
        <CardBody>
          <Box h="320px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey={metric} stroke="#168f7e" strokeWidth={3} dot={false} name={metric} />
                <Line type="monotone" dataKey="offlineShare" stroke="#d97706" strokeWidth={2} dot={false} name={t("offlineShare")} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <Text fontSize="sm" color="slate.600" mt={3}>
            {t("clinicalReviewNote")}
          </Text>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <Text fontWeight="700">{t("roleDistribution")}</Text>
          <Text fontSize="sm" color="slate.600">{t("roleDistributionSubtitle")}</Text>
        </CardHeader>
        <CardBody>
          <Box h="280px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} dataKey="users" nameKey="role" outerRadius={92} innerRadius={42}>
                  {roleData.map((entry, index) => (
                    <Cell key={entry.role} fill={["#168f7e", "#0f766e", "#2f855a", "#d97706", "#2563eb"][index % 5]} />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>
      <Card gridColumn={{ base: "auto", xl: "1 / span 2" }}>
        <CardHeader>
          <Text fontWeight="700">{t("operationalPerformanceMix")}</Text>
          <Text fontSize="sm" color="slate.600">{t("operationalPerformanceMixSubtitle")}</Text>
        </CardHeader>
        <CardBody>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="syncSuccess" stroke="#168f7e" fill="#99f6e4" />
                <Area type="monotone" dataKey="responseMs" stroke="#2563eb" fill="#bfdbfe" />
                <Area type="monotone" dataKey="astVolume" stroke="#d97706" fill="#fed7aa" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>
    </Grid>
  );
}

export function GeoOperationalView({ data, filters }: { data: DashboardData; filters: GlobalFiltersState }) {
  const { t } = useLocale();
  const rows = useMemo(() => getGeoRows(data, filters), [data, filters]);
  const [primaryCountry, setPrimaryCountry] = useState(rows[0]?.country ?? "");
  const [secondaryCountry, setSecondaryCountry] = useState(rows[1]?.country ?? "");
  const compare = rows.filter((row) => row.country === primaryCountry || row.country === secondaryCountry);

  return (
    <Grid templateColumns={{ base: "1fr", xl: "1.6fr 1fr" }} gap={4}>
      <Card>
        <CardHeader>
          <Text fontWeight="700">{t("countryOperationalFootprint")}</Text>
          <Text fontSize="sm" color="slate.600">{t("countryOperationalFootprintSubtitle")}</Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {rows.map((row) => (
              <Card key={row.id} bg="slate.50" border="1px solid" borderColor="slate.100">
                <CardBody>
                  <Flex justify="space-between" align="start" mb={3}>
                    <Box>
                      <Text fontWeight="700">{row.country}</Text>
                      <Text fontSize="sm" color="slate.600">{row.region}</Text>
                    </Box>
                    <Badge colorScheme={row.risk === "Healthy" ? "green" : row.risk === "Watch" ? "orange" : "red"}>
                      {row.risk}
                    </Badge>
                  </Flex>
                  <SimpleGrid columns={2} spacing={3} fontSize="sm">
                    <Box><Text color="slate.500">{t("activeLabs")}</Text><Text fontWeight="700">{row.activeLabs}</Text></Box>
                    <Box><Text color="slate.500">{t("astPrecision")}</Text><Text fontWeight="700">{row.astPrecision.toFixed(1)}%</Text></Box>
                    <Box><Text color="slate.500">{t("openIncidents")}</Text><Text fontWeight="700">{row.incidents}</Text></Box>
                    <Box><Text color="slate.500">{t("syncSuccess")}</Text><Text fontWeight="700">{row.syncSuccess.toFixed(1)}%</Text></Box>
                    <Box><Text color="slate.500">{t("connectivity")}</Text><Text fontWeight="700">{row.connectivity}</Text></Box>
                    <Box><Text color="slate.500">{t("dataTrust")}</Text><Text fontWeight="700">{row.dataQualityScore.toFixed(0)}/100</Text></Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <Text fontWeight="700">{t("compareTwoCountries")}</Text>
          <Text fontSize="sm" color="slate.600">{t("compareTwoCountriesSubtitle")}</Text>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <Stack direction={{ base: "column", md: "row" }}>
              <Select value={primaryCountry} onChange={(e) => setPrimaryCountry(e.target.value)}>
                {rows.map((row) => <option key={row.id} value={row.country}>{row.country}</option>)}
              </Select>
              <Select value={secondaryCountry} onChange={(e) => setSecondaryCountry(e.target.value)}>
                {rows.map((row) => <option key={row.id} value={row.country}>{row.country}</option>)}
              </Select>
            </Stack>
            <Box h="280px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compare}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="astPrecision" fill="#168f7e" name={t("astPrecision")} />
                  <Bar dataKey="dataQualityScore" fill="#2563eb" name={t("dataTrustScore")} />
                  <Bar dataKey="incidents" fill="#dc2626" name={t("openIncidents")} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Grid>
  );
}

function TableToolbar({
  title,
  subtitle,
  search,
  setSearch,
  exportName,
  rows,
  children,
}: {
  title: string;
  subtitle: string;
  search: string;
  setSearch: (value: string) => void;
  exportName: string;
  rows: Record<string, unknown>[];
  children?: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <Flex justify="space-between" align={{ base: "start", md: "center" }} flexWrap="wrap" gap={3}>
      <Box>
        <Text fontWeight="700">{title}</Text>
        <Text fontSize="sm" color="slate.600">{subtitle}</Text>
      </Box>
      <Flex gap={3} flexWrap="wrap" justify={{ base: "stretch", md: "flex-end" }}>
        {children}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search")}
          maxW={{ base: "full", md: "220px" }}
        />
        <CSVExportButton filename={exportName} rows={rows} />
      </Flex>
    </Flex>
  );
}

function paginate<T>(rows: T[], page: number, pageSize: number) {
  return rows.slice((page - 1) * pageSize, page * pageSize);
}

function statusColor(value: string) {
  if (value === "Closed" || value === "Healthy" || value === "Low") return "green";
  if (value === "Monitoring" || value === "Medium" || value === "Watch") return "orange";
  return "red";
}

export function LabsTable({ data, filters }: { data: DashboardData; filters: GlobalFiltersState }) {
  const { t } = useLocale();
  const rows = useMemo(() => getLabRows(data, filters), [data, filters]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof typeof rows[number]>("riskScore");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const disclosure = useDisclosure();

  const filteredRows = useMemo(() => {
    const value = search.toLowerCase();
    return rows
      .filter((row) => Object.values(row).some((cell) => String(cell).toLowerCase().includes(value)))
      .sort((a, b) => Number(b[sortKey] ?? 0) - Number(a[sortKey] ?? 0) || String(a.lab).localeCompare(String(b.lab)));
  }, [rows, search, sortKey]);

  const currentRows = paginate(filteredRows, page, 8);
  const selected = rows.find((row) => row.id === selectedId);

  return (
    <Card>
      <CardHeader>
        <TableToolbar
          title={t("laboratories")}
          subtitle={t("laboratoriesSubtitle")}
          search={search}
          setSearch={setSearch}
          exportName="antibiogo_laboratories.csv"
          rows={filteredRows}
        >
          <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} maxW="200px">
            <option value="riskScore">{t("sortByRisk")}</option>
            <option value="astPrecision">{t("sortByPrecision")}</option>
            <option value="syncSuccess">{t("sortBySyncSuccess")}</option>
            <option value="astPerMonth">{t("sortByAstVolume")}</option>
          </Select>
        </TableToolbar>
      </CardHeader>
      <CardBody overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>{t("lab")}</Th>
              <Th>{t("country")}</Th>
              <Th>{t("deployment")}</Th>
              <Th>{t("version")}</Th>
              <Th isNumeric>{t("activeUsers")}</Th>
              <Th isNumeric>AST/mo</Th>
              <Th isNumeric>{t("precision")}</Th>
              <Th isNumeric>{t("crash")}</Th>
              <Th isNumeric>{t("sync")}</Th>
              <Th>{t("lisStatus")}</Th>
              <Th>{t("dataQuality")}</Th>
              <Th>{t("risk")}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentRows.map((row) => (
              <Tr
                key={row.id}
                cursor="pointer"
                _hover={{ bg: "slate.50" }}
                onClick={() => {
                  setSelectedId(row.id);
                  disclosure.onOpen();
                }}
              >
                <Td>{row.lab}</Td>
                <Td>{row.country}</Td>
                <Td>{row.deploymentDate}</Td>
                <Td><Badge>{row.version}</Badge></Td>
                <Td isNumeric>{row.activeUsers}</Td>
                <Td isNumeric>{row.astPerMonth}</Td>
                <Td isNumeric>{row.astPrecision.toFixed(1)}%</Td>
                <Td isNumeric>{row.crashRate.toFixed(2)}%</Td>
                <Td isNumeric>{row.syncSuccess.toFixed(1)}%</Td>
                <Td>{row.lisStatus}</Td>
                <Td>{row.dataQuality}</Td>
                <Td>
                  <Tooltip label="Composite risk score driven by clinical errors, crash rate and sync fragility.">
                    <Badge colorScheme={statusColor(row.riskLevel)}>{row.riskLevel}</Badge>
                  </Tooltip>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Flex justify="space-between" mt={4}>
          <Text fontSize="sm" color="slate.600">{t("showing", { current: currentRows.length, total: filteredRows.length })}</Text>
          <HStack>
            <Button size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))}>{t("previous")}</Button>
            <Button size="sm" onClick={() => setPage((current) => (current * 8 < filteredRows.length ? current + 1 : current))}>{t("next")}</Button>
          </HStack>
        </Flex>
      </CardBody>
      <Drawer isOpen={disclosure.isOpen} placement="right" onClose={disclosure.onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{selected?.lab}</DrawerHeader>
          <DrawerBody>
            {selected ? (
              <Stack spacing={4}>
                <Text color="slate.600">{selected.country} · current version {selected.version}</Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Box><Text color="slate.500">Active users</Text><Text fontWeight="700">{selected.activeUsers}</Text></Box>
                  <Box><Text color="slate.500">AST per month</Text><Text fontWeight="700">{selected.astPerMonth}</Text></Box>
                  <Box><Text color="slate.500">Precision</Text><Text fontWeight="700">{selected.astPrecision.toFixed(1)}%</Text></Box>
                  <Box><Text color="slate.500">Sync success</Text><Text fontWeight="700">{selected.syncSuccess.toFixed(1)}%</Text></Box>
                </SimpleGrid>
                <Card bg="slate.50">
                  <CardBody>
                    <Text fontWeight="700" mb={2}>{t("latestFieldSignal")}</Text>
                    <Text fontSize="sm">{selected.latestFeedback}</Text>
                  </CardBody>
                </Card>
                <Card bg="orange.50">
                  <CardBody>
                    <Text fontWeight="700" mb={2}>{t("operationalInterpretation")}</Text>
                    <Text fontSize="sm">
                      {t("operationalInterpretationBody")}
                    </Text>
                  </CardBody>
                </Card>
              </Stack>
            ) : null}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}

export function FeedbackTable({ data, filters }: { data: DashboardData; filters: GlobalFiltersState }) {
  const { t } = useLocale();
  const rows = useMemo(() => getFeedbackRows(data, filters), [data, filters]);
  const [search, setSearch] = useState("");
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((cell) => String(cell).toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <Card>
      <CardHeader>
        <TableToolbar
          title={t("feedback")}
          subtitle={t("feedbackSubtitle")}
          search={search}
          setSearch={setSearch}
          exportName="antibiogo_feedback.csv"
          rows={filteredRows}
        />
      </CardHeader>
      <CardBody overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>{t("date")}</Th>
              <Th>{t("country")}</Th>
              <Th>{t("lab")}</Th>
              <Th>{t("channel")}</Th>
              <Th>{t("type")}</Th>
              <Th>{t("severity")}</Th>
              <Th>{t("status")}</Th>
              <Th isNumeric>{t("responseHours")}</Th>
              <Th>Verbatim</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRows.slice(0, 12).map((row) => (
              <Tr key={row.id}>
                <Td>{row.date}</Td>
                <Td>{row.country}</Td>
                <Td>{row.lab}</Td>
                <Td>{row.channel}</Td>
                <Td>{row.type}</Td>
                <Td><Badge colorScheme={statusColor(row.severity)}>{row.severity}</Badge></Td>
                <Td><Badge colorScheme={statusColor(row.status)}>{row.status}</Badge></Td>
                <Td isNumeric>{row.responseHours}</Td>
                <Td maxW="380px" whiteSpace="normal">{row.verbatim}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
}

export function IncidentTable({ data, filters }: { data: DashboardData; filters: GlobalFiltersState }) {
  const { t } = useLocale();
  const rows = useMemo(() => getIncidentRows(data, filters), [data, filters]);
  const [search, setSearch] = useState("");
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((cell) => String(cell).toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <Card>
      <CardHeader>
        <TableToolbar
          title={t("incidentsQa")}
          subtitle={t("incidentsQaSubtitle")}
          search={search}
          setSearch={setSearch}
          exportName="antibiogo_incidents.csv"
          rows={filteredRows}
        />
      </CardHeader>
      <CardBody overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>{t("date")}</Th>
              <Th>{t("version")}</Th>
              <Th>{t("type")}</Th>
              <Th>{t("country")}</Th>
              <Th>{t("lab")}</Th>
              <Th>{t("kpiTrigger")}</Th>
              <Th>{t("owner")}</Th>
              <Th>{t("action")}</Th>
              <Th>{t("status")}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRows.slice(0, 12).map((row) => (
              <Tr key={row.id}>
                <Td>{row.date}</Td>
                <Td><Badge>{row.version}</Badge></Td>
                <Td>{row.type}</Td>
                <Td>{row.country}</Td>
                <Td>{row.lab}</Td>
                <Td>{row.triggerKpi}</Td>
                <Td>{row.owner}</Td>
                <Td maxW="320px" whiteSpace="normal">{row.actionTaken}</Td>
                <Td><Badge colorScheme={statusColor(row.status)}>{row.status}</Badge></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
}

export function ClinicalQualityPanel({ data, filters }: { data: DashboardData; filters: GlobalFiltersState }) {
  const { t } = useLocale();
  const rows = useMemo(() => getClinicalRows(data, filters), [data, filters]);
  const versionData = useMemo(() => getVersionDistribution(data, filters), [data, filters]);
  return (
    <Grid templateColumns={{ base: "1fr", xl: "1.4fr 1fr" }} gap={4}>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="700">{t("clinicalQualityDetail")}</Text>
              <Text fontSize="sm" color="slate.600">{t("clinicalQualityDetailSubtitle")}</Text>
            </Box>
            <InfoPopover title={t("clinicalQualityNotes")}>
              <Stack spacing={3} fontSize="sm">
                <Text>{t("astPrecisionDef")}</Text>
                <Text>{t("globalPrecisionVsCritical")}</Text>
                <Text>{t("whyVmeMatters")}</Text>
              </Stack>
            </InfoPopover>
          </Flex>
        </CardHeader>
        <CardBody overflowX="auto">
          <HStack justify="end" mb={3}>
            <CSVExportButton filename="antibiogo_clinical_quality.csv" rows={rows} />
          </HStack>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>{t("bacteria")}</Th>
                <Th isNumeric>{t("volume")}</Th>
                <Th isNumeric>{t("precision")}</Th>
                <Th isNumeric>{t("criticalErrors")}</Th>
                <Th isNumeric>{t("manualValidation")}</Th>
                <Th>{t("topAntibiotic")}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row) => (
                <Tr key={row.bacteria}>
                  <Td>{row.bacteria}</Td>
                  <Td isNumeric>{row.volume}</Td>
                  <Td isNumeric>{row.precision.toFixed(1)}%</Td>
                  <Td isNumeric>{row.criticalErrors.toFixed(2)}%</Td>
                  <Td isNumeric>{row.manualValidation.toFixed(1)}%</Td>
                  <Td>{row.topAntibiotic}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <Text fontWeight="700">{t("performanceByVersion")}</Text>
          <Text fontSize="sm" color="slate.600">{t("performanceByVersionSubtitle")}</Text>
        </CardHeader>
        <CardBody>
          <Box h="320px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={versionData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="version" />
                <YAxis />
                <Legend />
                <RechartsTooltip />
                <Bar dataKey="labs" fill="#168f7e" name={t("labsDeployed")} />
                <Bar dataKey="incidents" fill="#dc2626" name={t("incidents")} />
                <Bar dataKey="precision" fill="#2563eb" name={t("precision")} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>
    </Grid>
  );
}

export function ActionCenter({ data, filters }: { data: DashboardData; filters: GlobalFiltersState }) {
  const { t } = useLocale();
  const items = useMemo(() => getActionItems(data, filters), [data, filters]);
  return (
    <Card>
      <CardHeader>
        <Text fontWeight="700">{t("recommendedActions")}</Text>
        <Text fontSize="sm" color="slate.600">{t("recommendedActionsSubtitle")}</Text>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
          {items.map((item) => (
            <Card key={item.title} bg={item.priority === "High" ? "red.50" : "gray.50"}>
              <CardBody>
                <Flex justify="space-between" align="start" mb={3}>
                  <Text fontWeight="700">{item.title}</Text>
                  <Badge colorScheme={item.priority === "High" ? "red" : "gray"}>{item.priority}</Badge>
                </Flex>
                <Stack spacing={2} fontSize="sm">
                  <Text><strong>{t("rationale")}:</strong> {item.rationale}</Text>
                  <Text><strong>{t("owner")}:</strong> {item.owner}</Text>
                  <Text><strong>{t("nextStep")}:</strong> {item.nextStep}</Text>
                  <Text><strong>{t("reviewDate")}:</strong> {item.reviewDate}</Text>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
}
