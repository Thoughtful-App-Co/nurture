import "../global.css";
import "../polyfills";
import { Stack } from "expo-router";
import { JazzProvider } from "@/jazz/provider";
import { DevToolsMenu } from "@/components/dev/DevToolsMenu";
import { 
  useFonts,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

function RootLayoutNav() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // Wait for fonts to load
  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {/* Dev tools menu - only shows in __DEV__ mode */}
      <DevToolsMenu />
    </>
  );
}

export default function RootLayout() {
  return (
    <JazzProvider>
      <RootLayoutNav />
    </JazzProvider>
  );
}
