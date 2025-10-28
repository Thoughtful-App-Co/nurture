import "../global.css";
import "../polyfills";
import { Stack } from "expo-router";
import { JazzProvider } from "@/jazz/provider";

export default function RootLayout() {
  return (
    <JazzProvider>
      <Stack />
    </JazzProvider>
  );
}
