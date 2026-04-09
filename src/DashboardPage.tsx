import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
            borderRadius="24px"
            bg="white"
            border="1px solid"
            borderColor="blackAlpha.100"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" left={0} top={0} bottom={0} w={{ base: "8px", md: "12px" }} bg="msf.500" />
            <Flex justify="space-between" align={{ base: "start", lg: "end" }} gap={5} flexWrap="wrap">
              <Box maxW="820px" pl={{ base: 2, md: 4 }}>
                <HStack spacing={3} mb={4} flexWrap="wrap">
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">Mock environment</Badge>
                  <Badge bg="black" color="white" px={3} py={1} borderRadius="full">SaMD / AST / LMIC</Badge>
                  <Badge colorScheme="red" px={3} py={1} borderRadius="full">Product + QA/RA + Ops</Badge>
                </HStack>
                <Heading size="2xl" mb={3} color="gray.900">Antibiogo Dashboard</Heading>
                <Text fontSize="lg" color="gray.700">
                  KPI cockpit for a medical SaMD deployed across microbiology laboratories in LMIC settings, combining technical robustness, adoption, clinical quality and governance.
                </Text>
              </Box>
              <Stack
                spacing={2}
                bg="gray.50"
                p={5}
                borderRadius="18px"
                minW={{ base: "full", lg: "360px" }}
                border="1px solid"
                borderColor="blackAlpha.100"
              >
                <Text fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="0.08em">Last mock refresh</Text>
                <Text fontSize="xl" fontWeight="700" color="gray.900">{data.generatedAt.slice(0, 10)}</Text>
                <Text fontSize="sm" color="gray.700">
                  Perimeter: {data.countries.length} countries, {data.labs.length} labs, {data.users.length} users, {data.astRecords.length.toLocaleString()} AST records, {data.sessions.length.toLocaleString()} sessions.
                </Text>
              </Stack>
            </Flex>
          </Box>

          <GlobalFilters data={data} filters={filters} setFilters={setFilters} />

          <Tabs variant="line" colorScheme="red" isLazy>
            <TabList
              bg="transparent"
              borderBottom="1px solid"
              borderColor="blackAlpha.200"
              gap={2}
              flexWrap="wrap"
            >
              <Tab>Overview</Tab>
              <Tab>Geography & Labs</Tab>
              <Tab>Field Ops</Tab>
              <Tab>Clinical Quality</Tab>
            </TabList>

            <TabPanels px={0}>
              <TabPanel px={0} pt={6}>
                <Stack spacing={6}>
                  <KPIGrid data={data} filters={filters} />
                  <TimeSeriesPanel data={data} filters={filters} />
                </Stack>
              </TabPanel>

              <TabPanel px={0} pt={6}>
                <Stack spacing={6}>
                  <GeoOperationalView data={data} filters={filters} />
                  <LabsTable data={data} filters={filters} />
                </Stack>
              </TabPanel>

              <TabPanel px={0} pt={6}>
                <Stack spacing={6}>
                  <ActionCenter data={data} filters={filters} />
                  <FeedbackTable data={data} filters={filters} />
                  <IncidentTable data={data} filters={filters} />
                </Stack>
              </TabPanel>

              <TabPanel px={0} pt={6}>
                <ClinicalQualityPanel data={data} filters={filters} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stack>
      </Container>
    </Box>
  );
}
