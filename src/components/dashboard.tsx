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
      <PopoverContent borderRadius="14px" borderColor="blackAlpha.200">
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
  return (
    <Button
      leftIcon={<DownloadIcon />}
      size="sm"
      variant="outline"
      onClick={() => exportRowsToCsv(filename, rows)}
    >
      Export CSV
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
                borderRadius="full"
                p={2}
                align="center"
                justify="center"
                color={toneColor(item.tone)}
              >
                <Icon as={KpiIcon} boxSize={5} />
              </Flex>
              <InfoPopover title={`How to read ${item.label}`}>
                <Stack spacing={3} fontSize="sm">
                  <Text><strong>Definition:</strong> {item.description}</Text>
                  <Text><strong>Formula:</strong> {item.formula}</Text>
                  <Text><strong>Why it matters:</strong> This KPI helps product, QA/RA and field teams separate site frictions from true product regressions.</Text>
                  <Text><strong>Threshold:</strong> {item.threshold}</Text>
                  <Text><strong>Suggested action:</strong> {item.action}</Text>
                </Stack>
              </InfoPopover>
            </HStack>
          </Flex>
          <StatHelpText mb={0} color={`${deltaColor(item.delta)}.600`}>
            {item.delta >= 0 ? "+" : ""}
            {item.delta.toFixed(1)}% vs previous period
          </StatHelpText>
          <Badge mt={3} colorScheme={item.delta >= 0 ? "green" : "red"} borderRadius="full" px={3} py={1}>
            {item.delta >= 0 ? "Trending better" : "Needs attention"}
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
          <Flex justify="space-between" flexWrap="wrap" gap={3}>
            <HStack spacing={3} flexWrap="wrap">
              <FormControl maxW="180px">
                <FormLabel fontSize="sm">Relative period</FormLabel>
                <Select
                  value={filters.periodMonths}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, periodMonths: Number(event.target.value) }))
                  }
                >
                  <option value={3}>Last 3 months</option>
                  <option value={6}>Last 6 months</option>
                  <option value={12}>Last 12 months</option>
                  <option value={24}>Last 24 months</option>
                </Select>
              </FormControl>
              <FormControl maxW="220px">
                <FormLabel fontSize="sm">Country focus</FormLabel>
                <Select
                  value={filters.countryIds[0] ?? ""}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      countryIds: event.target.value ? [event.target.value] : [],
                    }))
                  }
                >
                  <option value="">All countries</option>
                  {meta.countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl maxW="220px">
                <FormLabel fontSize="sm">Version focus</FormLabel>
                <Select
                  value={filters.versionIds[0] ?? ""}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      versionIds: event.target.value ? [event.target.value] : [],
                    }))
                  }
                >
                  <option value="">All versions</option>
                  {meta.versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.id}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <InfoPopover title="About filters">
                <Stack spacing={3} fontSize="sm">
                  <Text><strong>Version:</strong> helps isolate regressions after rollout versus site-level constraints.</Text>
                  <Text><strong>Connectivity:</strong> useful to separate product defects from offline operating context.</Text>
                  <Text><strong>Clinical quality:</strong> bacteria and antibiotic filters support targeted AST rule review.</Text>
                </Stack>
              </InfoPopover>
            </HStack>
            <Stack direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }}>
              <Badge colorScheme={activeCount ? "teal" : "gray"} borderRadius="full" px={3} py={1}>
                {activeCount} active filters
              </Badge>
              <Button leftIcon={<SettingsIcon />} onClick={onOpen}>
                Advanced filters
              </Button>
              <Button variant="ghost" onClick={() => setFilters(defaultFilters)}>
                Reset
              </Button>
            </Stack>
          </Flex>
          <HStack spacing={2} flexWrap="wrap">
            {activeChips.length ? (
              activeChips.slice(0, 10).map((chip) => (
                <Badge key={chip.key} bg="gray.100" color="gray.800" borderRadius="full" px={3} py={1}>
                  {chip.label}
                </Badge>
              ))
            ) : (
              <Text fontSize="sm" color="slate.600">
                No advanced filters applied. The dashboard currently shows the full mock programme perimeter.
              </Text>
            )}
          </HStack>
        </Stack>
      </CardBody>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Advanced global filters</DrawerHeader>
          <DrawerBody>
            <Stack spacing={6}>
              <FilterChecklist
                label="Regions"
                options={[...new Set(meta.countries.map((item) => item.region))]}
                value={filters.regions}
                onChange={(next) => setFilters((current) => ({ ...current, regions: next as GlobalFiltersState["regions"] }))}
              />
              <FilterChecklist
                label="Laboratories"
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
                label="Lab type"
                options={[...new Set(meta.labs.map((item) => item.type))]}
                value={filters.labTypes}
                onChange={(next) => setFilters((current) => ({ ...current, labTypes: next as GlobalFiltersState["labTypes"] }))}
              />
              <FilterChecklist
                label="LIS status"
                helper="Use this to separate stable integrations from pilot mappings."
                options={[...new Set(meta.labs.map((item) => item.lisStatus))]}
                value={filters.lisStatuses}
                onChange={(next) => setFilters((current) => ({ ...current, lisStatuses: next as GlobalFiltersState["lisStatuses"] }))}
              />
              <FilterChecklist
                label="Connectivity"
                helper="Useful in LMIC contexts to compare robust sites versus constrained offline-heavy sites."
                options={[...new Set(meta.labs.map((item) => item.connectivityLevel))]}
                value={filters.connectivityLevels}
                onChange={(next) => setFilters((current) => ({ ...current, connectivityLevels: next as GlobalFiltersState["connectivityLevels"] }))}
              />
              <FilterChecklist
                label="Usage mode"
                options={["Online", "Offline"]}
                value={filters.usageModes}
                onChange={(next) => setFilters((current) => ({ ...current, usageModes: next as GlobalFiltersState["usageModes"] }))}
              />
              <FilterChecklist
                label="User role"
                options={["Lab technician", "Microbiologist", "QA lead", "Program admin", "IT focal point"]}
                value={filters.userRoles}
                onChange={(next) => setFilters((current) => ({ ...current, userRoles: next as GlobalFiltersState["userRoles"] }))}
              />
              <FilterChecklist
                label="Bacteria"
                helper="Useful for AST rule coverage and critical error review."
                options={bacteriaOptions}
                value={filters.bacteria}
                onChange={(next) => setFilters((current) => ({ ...current, bacteria: next }))}
              />
              <FilterChecklist
                label="Antibiotic"
                options={antibioticOptions}
                value={filters.antibiotics}
                onChange={(next) => setFilters((current) => ({ ...current, antibiotics: next }))}
              />
              <FilterChecklist
                label="Feedback type"
                options={["UX", "Bug", "Bacteria content", "Performance", "LIS", "Training"]}
                value={filters.feedbackTypes}
                onChange={(next) => setFilters((current) => ({ ...current, feedbackTypes: next as GlobalFiltersState["feedbackTypes"] }))}
              />
              <FilterChecklist
                label="Incident severity"
                options={["Low", "Medium", "High", "Critical"]}
                value={filters.incidentSeverities}
                onChange={(next) => setFilters((current) => ({ ...current, incidentSeverities: next as GlobalFiltersState["incidentSeverities"] }))}
              />
              <FilterChecklist
                label="CAPA status"
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
  const series = useMemo(() => getTimeSeries(data, filters), [data, filters]);
  const roleData = useMemo(() => getRoleDistribution(data, filters), [data, filters]);
  const [metric, setMetric] = useState<"astVolume" | "astPrecision" | "crashRate" | "avgEntryTime" | "syncSuccess">("astVolume");

  return (
    <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={4}>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <Box>
              <Text fontWeight="700">Temporal signals</Text>
              <Text fontSize="sm" color="slate.600">Monthly trend view for product, operational and clinical indicators.</Text>
            </Box>
            <Select maxW="230px" value={metric} onChange={(e) => setMetric(e.target.value as typeof metric)}>
              <option value="astVolume">AST volume</option>
              <option value="astPrecision">AST precision</option>
              <option value="crashRate">Crash rate</option>
              <option value="avgEntryTime">Entry time</option>
              <option value="syncSuccess">Sync success</option>
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
                <Line type="monotone" dataKey="offlineShare" stroke="#d97706" strokeWidth={2} dot={false} name="Offline share %" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <Text fontSize="sm" color="slate.600" mt={3}>
            Automatic annotation logic flags months with increased critical error burden for clinical review.
          </Text>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <Text fontWeight="700">Role distribution</Text>
          <Text fontSize="sm" color="slate.600">Role mix helps interpret adoption, governance maturity and support load.</Text>
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
          <Text fontWeight="700">Operational performance mix</Text>
          <Text fontSize="sm" color="slate.600">Overlay of sync resilience, product responsiveness and AST output.</Text>
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
  const rows = useMemo(() => getGeoRows(data, filters), [data, filters]);
  const [primaryCountry, setPrimaryCountry] = useState(rows[0]?.country ?? "");
  const [secondaryCountry, setSecondaryCountry] = useState(rows[1]?.country ?? "");
  const compare = rows.filter((row) => row.country === primaryCountry || row.country === secondaryCountry);

  return (
    <Grid templateColumns={{ base: "1fr", xl: "1.6fr 1fr" }} gap={4}>
      <Card>
        <CardHeader>
          <Text fontWeight="700">Country operational footprint</Text>
          <Text fontSize="sm" color="slate.600">A spatial proxy view combining adoption, trust, incidents and connectivity risk.</Text>
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
                    <Box><Text color="slate.500">Active labs</Text><Text fontWeight="700">{row.activeLabs}</Text></Box>
                    <Box><Text color="slate.500">AST precision</Text><Text fontWeight="700">{row.astPrecision.toFixed(1)}%</Text></Box>
                    <Box><Text color="slate.500">Open incidents</Text><Text fontWeight="700">{row.incidents}</Text></Box>
                    <Box><Text color="slate.500">Sync success</Text><Text fontWeight="700">{row.syncSuccess.toFixed(1)}%</Text></Box>
                    <Box><Text color="slate.500">Connectivity</Text><Text fontWeight="700">{row.connectivity}</Text></Box>
                    <Box><Text color="slate.500">Data trust</Text><Text fontWeight="700">{row.dataQualityScore.toFixed(0)}/100</Text></Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <Text fontWeight="700">Compare two countries</Text>
          <Text fontSize="sm" color="slate.600">Useful in programme reviews to contrast maturity and operational drag.</Text>
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
                  <Bar dataKey="astPrecision" fill="#168f7e" name="AST precision %" />
                  <Bar dataKey="dataQualityScore" fill="#2563eb" name="Data trust score" />
                  <Bar dataKey="incidents" fill="#dc2626" name="Open incidents" />
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
          placeholder="Search"
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
          title="Laboratories"
          subtitle="Deployment health, adoption, clinical precision and operational risk by site."
          search={search}
          setSearch={setSearch}
          exportName="antibiogo_laboratories.csv"
          rows={filteredRows}
        >
          <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} maxW="200px">
            <option value="riskScore">Sort by risk</option>
            <option value="astPrecision">Sort by precision</option>
            <option value="syncSuccess">Sort by sync success</option>
            <option value="astPerMonth">Sort by AST volume</option>
          </Select>
        </TableToolbar>
      </CardHeader>
      <CardBody overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Lab</Th>
              <Th>Country</Th>
              <Th>Deployment</Th>
              <Th>Version</Th>
              <Th isNumeric>Active users</Th>
              <Th isNumeric>AST/mo</Th>
              <Th isNumeric>Precision</Th>
              <Th isNumeric>Crash</Th>
              <Th isNumeric>Sync</Th>
              <Th>LIS</Th>
              <Th>Data quality</Th>
              <Th>Risk</Th>
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
          <Text fontSize="sm" color="slate.600">Showing {currentRows.length} of {filteredRows.length} labs</Text>
          <HStack>
            <Button size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
            <Button size="sm" onClick={() => setPage((current) => (current * 8 < filteredRows.length ? current + 1 : current))}>Next</Button>
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
                    <Text fontWeight="700" mb={2}>Latest field signal</Text>
                    <Text fontSize="sm">{selected.latestFeedback}</Text>
                  </CardBody>
                </Card>
                <Card bg="orange.50">
                  <CardBody>
                    <Text fontWeight="700" mb={2}>Operational interpretation</Text>
                    <Text fontSize="sm">
                      This site risk score is designed for programme review. High scores usually mix unstable sync, fragile adoption, or elevated clinical validation burden after rollout.
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
  const rows = useMemo(() => getFeedbackRows(data, filters), [data, filters]);
  const [search, setSearch] = useState("");
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((cell) => String(cell).toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <Card>
      <CardHeader>
        <TableToolbar
          title="Feedback"
          subtitle="Field signal stream across survey, in-app, support and WhatsApp channels."
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
              <Th>Date</Th>
              <Th>Country</Th>
              <Th>Lab</Th>
              <Th>Channel</Th>
              <Th>Type</Th>
              <Th>Severity</Th>
              <Th>Status</Th>
              <Th isNumeric>Response h</Th>
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
  const rows = useMemo(() => getIncidentRows(data, filters), [data, filters]);
  const [search, setSearch] = useState("");
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((cell) => String(cell).toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <Card>
      <CardHeader>
        <TableToolbar
          title="Incidents and QA"
          subtitle="Operational anomalies, CAPA-linked issues and version-specific incidents."
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
              <Th>Date</Th>
              <Th>Version</Th>
              <Th>Type</Th>
              <Th>Country</Th>
              <Th>Lab</Th>
              <Th>KPI trigger</Th>
              <Th>Owner</Th>
              <Th>Action</Th>
              <Th>Status</Th>
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
  const rows = useMemo(() => getClinicalRows(data, filters), [data, filters]);
  const versionData = useMemo(() => getVersionDistribution(data, filters), [data, filters]);
  return (
    <Grid templateColumns={{ base: "1fr", xl: "1.4fr 1fr" }} gap={4}>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="700">Clinical quality detail</Text>
              <Text fontSize="sm" color="slate.600">Species-level concordance, critical error burden and manual validation patterns.</Text>
            </Box>
            <InfoPopover title="Clinical quality notes">
              <Stack spacing={3} fontSize="sm">
                <Text><strong>AST precision:</strong> proportion of software interpretations matching the reference interpretation.</Text>
                <Text><strong>Global precision vs critical errors:</strong> a small number of mismatches can remain clinically sensitive when they are very major errors.</Text>
                <Text><strong>Why VME matters:</strong> false susceptibility can drive unsafe treatment decisions and must be tracked with heightened QA/RA scrutiny.</Text>
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
                <Th>Bacteria</Th>
                <Th isNumeric>Volume</Th>
                <Th isNumeric>Precision</Th>
                <Th isNumeric>Critical errors</Th>
                <Th isNumeric>Manual validation</Th>
                <Th>Top antibiotic</Th>
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
          <Text fontWeight="700">Performance by version</Text>
          <Text fontSize="sm" color="slate.600">Release quality view linking rollout footprint, incidents and concordance.</Text>
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
                <Bar dataKey="labs" fill="#168f7e" name="Labs deployed" />
                <Bar dataKey="incidents" fill="#dc2626" name="Incidents" />
                <Bar dataKey="precision" fill="#2563eb" name="Precision %" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>
    </Grid>
  );
}

export function ActionCenter({ data, filters }: { data: DashboardData; filters: GlobalFiltersState }) {
  const items = useMemo(() => getActionItems(data, filters), [data, filters]);
  return (
    <Card>
      <CardHeader>
        <Text fontWeight="700">Recommended actions</Text>
        <Text fontSize="sm" color="slate.600">Operational watchlist translating KPI drift into product, QA/RA and field actions.</Text>
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
                  <Text><strong>Rationale:</strong> {item.rationale}</Text>
                  <Text><strong>Owner:</strong> {item.owner}</Text>
                  <Text><strong>Next step:</strong> {item.nextStep}</Text>
                  <Text><strong>Review date:</strong> {item.reviewDate}</Text>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
}
