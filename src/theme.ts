import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: '"Avenir Next", "Helvetica Neue", sans-serif',
    body: '"Avenir Next", "Helvetica Neue", sans-serif',
  },
  colors: {
    msf: {
      50: "#fff3f2",
      100: "#ffd9d5",
      200: "#ffbeb7",
      300: "#ffa299",
      400: "#ff877a",
      500: "#ef3b2d",
      600: "#c92d21",
      700: "#9f2118",
      800: "#75150f",
      900: "#4b0906",
    },
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
        bg: "#f3f3f1",
        color: "#1f1f1f",
      },
    },
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: "msf.500",
          color: "white",
          _hover: { bg: "msf.600" },
        },
        outline: {
          borderColor: "blackAlpha.300",
          color: "slate.900",
          _hover: { bg: "blackAlpha.50" },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "18px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
          border: "1px solid",
          borderColor: "blackAlpha.100",
          bg: "white",
        },
      },
    },
    Tabs: {
      variants: {
        line: {
          tab: {
            fontWeight: "700",
            color: "slate.700",
            _selected: {
              color: "msf.600",
              borderColor: "msf.500",
            },
          },
        },
      },
    },
  },
});
