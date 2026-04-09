import {
  Badge,
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { mockDashboardData } from "./data/mockData";
import {
  ActionCenter,
  ClinicalQualityPanel,
  FeedbackTable,
  GeoOperationalView,
  GlobalFilters,
  IncidentTable,
  KPIGrid,
  LabsTable,
  TimeSeriesPanel,
} from "./components/dashboard";
import { defaultFilters } from "./utils/dashboard";

export function DashboardPage() {
  const data = useMemo(() => mockDashboardData, []);
  const [filters, setFilters] = useState(defaultFilters);

  return (
    <Box minH="100vh" bg="slate.50" py={8}>
      <Container maxW="1680px">
        <Stack spacing={6}>
          <Box
            px={{ base: 6, md: 8 }}
            py={{ base: 6, md: 8 }}
            borderRadius="32px"
            bg="linear-gradient(135deg, #102a43 0%, #1f4f63 52%, #e6fffb 160%)"
            color="white"
          >
            <Flex justify="space-between" align={{ base: "start", lg: "end" }} gap={5} flexWrap="wrap">
              <Box maxW="820px">
                <HStack spacing={3} mb={4} flexWrap="wrap">
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">Mock environment</Badge>
                  <Badge colorScheme="cyan" px={3} py={1} borderRadius="full">SaMD / AST / LMIC</Badge>
                  <Badge colorScheme="orange" px={3} py={1} borderRadius="full">Product + QA/RA + Ops</Badge>
                </HStack>
                <Heading size="2xl" mb={3}>Antibiogo Programme Intelligence Dashboard</Heading>
                <Text fontSize="lg" color="whiteAlpha.900">
                  KPI cockpit for a medical SaMD deployed across microbiology laboratories in LMIC settings, combining technical robustness, adoption, clinical quality and governance.
                </Text>
              </Box>
              <Stack spacing={2} bg="whiteAlpha.160" p={5} borderRadius="24px" minW={{ base: "full", lg: "360px" }}>
                <Text fontSize="sm" color="whiteAlpha.800">Last mock refresh</Text>
                <Text fontSize="xl" fontWeight="700">{data.generatedAt.slice(0, 10)}</Text>
                <Text fontSize="sm" color="whiteAlpha.800">
                  Perimeter: {data.countries.length} countries, {data.labs.length} labs, {data.users.length} users, {data.astRecords.length.toLocaleString()} AST records, {data.sessions.length.toLocaleString()} sessions.
                </Text>
              </Stack>
            </Flex>
          </Box>

          <GlobalFilters data={data} filters={filters} setFilters={setFilters} />

          <KPIGrid data={data} filters={filters} />

          <TimeSeriesPanel data={data} filters={filters} />

          <GeoOperationalView data={data} filters={filters} />

          <LabsTable data={data} filters={filters} />

          <Stack spacing={4}>
            <Divider />
            <Text fontWeight="700" color="slate.700">Field signal and quality operations</Text>
          </Stack>

          <FeedbackTable data={data} filters={filters} />

          <IncidentTable data={data} filters={filters} />

          <ClinicalQualityPanel data={data} filters={filters} />

          <ActionCenter data={data} filters={filters} />

          <Box px={4} py={6}>
            <Text fontWeight="700" mb={2}>Architecture note</Text>
            <Text color="slate.700">
              The app uses a single React state store for global filters, deterministic mock data generators in <code>src/data/mockData.ts</code>, aggregation helpers in <code>src/utils/dashboard.ts</code>, and Chakra UI sections designed for product review, QA/RA triage and programme operations. Data intentionally reflects rollout maturity, connectivity variability, LIS adoption and clinical rule sensitivity over 24 months.
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
