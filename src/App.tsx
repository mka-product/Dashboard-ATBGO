import { DashboardPage } from "./DashboardPage";
import { LocaleProvider } from "./i18n";

export default function App() {
  return (
    <LocaleProvider>
      <DashboardPage />
    </LocaleProvider>
  );
}
