import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
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
import { useLocale } from "./i18n";
import { defaultFilters } from "./utils/dashboard";

export function DashboardPage() {
  const data = useMemo(() => mockDashboardData, []);
  const [filters, setFilters] = useState(defaultFilters);
  const [disclaimerOpen, setDisclaimerOpen] = useState(true);
  const { locale, setLocale, t } = useLocale();

  return (
    <Box minH="100vh" bg="slate.50" pt={disclaimerOpen ? { base: "220px", md: "170px", xl: "150px" } : "72px"} pb={8}>
      {disclaimerOpen ? (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          zIndex={20}
          bg="msf.700"
          color="white"
          borderBottom="1px solid rgba(255,255,255,0.16)"
        >
          <Container maxW="1680px" py={3}>
            <Flex justify="space-between" align="start" gap={4}>
              <Alert
                status="error"
                variant="left-accent"
                bg="transparent"
                color="white"
                borderRadius="0"
                alignItems="start"
                px={0}
                flex="1"
              >
                <AlertIcon color="white" mt="1" />
                <Box>
                  <AlertTitle fontSize="sm" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em">
                    {t("demoBannerTitle")}
                  </AlertTitle>
                  <AlertDescription fontSize="sm" color="whiteAlpha.900">
                    {t("demoBannerBody")}
                  </AlertDescription>
                </Box>
              </Alert>
              <Button
                size="sm"
                variant="outline"
                borderColor="whiteAlpha.500"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => setDisclaimerOpen(false)}
                flexShrink={0}
              >
                {t("hideDisclaimer")}
              </Button>
            </Flex>
          </Container>
        </Box>
      ) : (
        <Box position="fixed" top="0" left="0" right="0" zIndex={20} bg="msf.700" color="white">
          <Container maxW="1680px" py={3}>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} flexWrap="wrap">
              <Box>
                <Text fontSize="sm" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em">
                  {t("demoBannerTitle")}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.900">
                  {t("demoBannerCollapsed")}
                </Text>
              </Box>
              <Button
                size="sm"
                variant="outline"
                borderColor="whiteAlpha.500"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => setDisclaimerOpen(true)}
              >
                {t("showDisclaimer")}
              </Button>
            </Flex>
          </Container>
        </Box>
      )}
      <Container maxW="1680px">
        <Stack spacing={6}>
          <Box
            px={{ base: 6, md: 8 }}
            py={{ base: 5, md: 6 }}
            borderRadius="6px"
            bg="white"
            border="1px solid"
            borderColor="blackAlpha.100"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" left={0} top={0} bottom={0} w={{ base: "8px", md: "12px" }} bg="msf.500" />
            <Stack spacing={5} pl={{ base: 2, md: 4 }}>
              <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} flexWrap="wrap">
                <Text
                  fontSize="xs"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  fontWeight="800"
                >
                  SaMD / AST / LMIC
                </Text>
                <Flex align="center" gap={3}>
                  <Text fontSize="sm" color="gray.600" fontWeight="700">{t("language")}</Text>
                  <Box minW="140px">
                    <select
                      aria-label={t("language")}
                      value={locale}
                      onChange={(event) => setLocale(event.target.value as "en" | "fr")}
                      style={{
                        width: "100%",
                        border: "1px solid rgba(0,0,0,0.12)",
                        borderRadius: "4px",
                        padding: "10px 12px",
                        background: "white",
                      }}
                      >
                        <option value="en">🇬🇧 {t("english")}</option>
                        <option value="fr">🇫🇷 {t("french")}</option>
                      </select>
                    </Box>
                  </Flex>
              </Flex>

              <Flex justify="space-between" align={{ base: "start", xl: "stretch" }} gap={6} flexWrap="wrap">
                <Box flex="1 1 720px" maxW="860px">
                  <Heading size="2xl" mb={3} color="gray.900" lineHeight="1.05">
                    {t("dashboardTitle")}
                  </Heading>
                  <Text fontSize={{ base: "md", md: "lg" }} color="gray.700" maxW="760px">
                    {t("dashboardSubtitle")}
                  </Text>
                </Box>

                <Stack
                  spacing={3}
                  bg="gray.50"
                  p={5}
                  borderRadius="4px"
                  minW={{ base: "full", xl: "380px" }}
                  maxW={{ base: "full", xl: "420px" }}
                  border="1px solid"
                  borderColor="blackAlpha.100"
                >
                  <Text fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="0.08em">
                    {t("lastMockRefresh")}
                  </Text>
                  <Text fontSize="xl" fontWeight="700" color="gray.900">{data.generatedAt.slice(0, 10)}</Text>
                  <Text fontSize="sm" color="gray.700">
                    {t("perimeter", {
                      countries: data.countries.length,
                      labs: data.labs.length,
                      users: data.users.length,
                      astRecords: data.astRecords.length.toLocaleString(locale === "fr" ? "fr-FR" : "en-US"),
                      sessions: data.sessions.length.toLocaleString(locale === "fr" ? "fr-FR" : "en-US"),
                    })}
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    <Box px={3} py={1.5} bg="white" border="1px solid" borderColor="blackAlpha.100" fontSize="xs" fontWeight="700">
                      {data.countries.length} countries
                    </Box>
                    <Box px={3} py={1.5} bg="white" border="1px solid" borderColor="blackAlpha.100" fontSize="xs" fontWeight="700">
                      {data.labs.length} labs
                    </Box>
                    <Box px={3} py={1.5} bg="white" border="1px solid" borderColor="blackAlpha.100" fontSize="xs" fontWeight="700">
                      {data.users.length} users
                    </Box>
                  </HStack>
                </Stack>
              </Flex>
            </Stack>
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
              <Tab>{t("overview")}</Tab>
              <Tab>{t("geographyLabs")}</Tab>
              <Tab>{t("fieldOps")}</Tab>
              <Tab>{t("clinicalQuality")}</Tab>
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
