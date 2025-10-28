import "../global.css";
import "../polyfills";
import { Stack } from "expo-router";
import { JazzProvider } from "@/jazz/provider";
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

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <JazzProvider>
      <RootLayoutNav />
    </JazzProvider>
  );
}
