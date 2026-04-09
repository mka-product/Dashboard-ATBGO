import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: '"Avenir Next", "Segoe UI", sans-serif',
    body: '"IBM Plex Sans", "Segoe UI", sans-serif',
  },
  colors: {
    slate: {
      50: "#f5f8fb",
      100: "#d9e2ec",
      200: "#bcccdc",
      300: "#9fb3c8",
      400: "#829ab1",
      500: "#627d98",
      600: "#486581",
      700: "#334e68",
      800: "#243b53",
      900: "#102a43",
    },
    tealBrand: {
      50: "#e6fffb",
      100: "#baf4eb",
      200: "#8ee8db",
      300: "#63dccb",
      400: "#39d0bb",
      500: "#20b7a2",
      600: "#168f7e",
      700: "#0d685c",
      800: "#04413a",
      900: "#001b18",
    },
    sand: {
      50: "#faf7f2",
      100: "#f1eadf",
      200: "#e8dcc9",
      300: "#deceb3",
      400: "#d5c19d",
      500: "#bca883",
      600: "#927f64",
      700: "#685845",
      800: "#3f3227",
      900: "#171009",
    },
  },
  styles: {
    global: {
      body: {
        bg: "slate.50",
        color: "slate.900",
      },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          borderRadius: "24px",
          boxShadow: "0 18px 40px rgba(16, 42, 67, 0.08)",
        },
      },
    },
  },
});
