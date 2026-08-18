import { Stack } from "expo-router";

import { getCalcColors } from "../../components/calculadora/colors";
import { useTheme } from "../../services/ThemeContext";

export default function CalculadoraLayout() {
  const { isDark } = useTheme();
  const colors = getCalcColors(isDark);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
        animation: "none",
        gestureEnabled: false,
        freezeOnBlur: false,
        contentStyle: {
          backgroundColor: colors.bg,
        },
      }}
    >
      <Stack.Screen
        name="calculadora"
        options={{
          headerShown: false,
          presentation: "card",
          animation: "none",
          contentStyle: {
            backgroundColor: colors.bg,
          },
        }}
      />

      <Stack.Screen
        name="historial"
        options={{
          headerShown: false,
          presentation: "card",
          animation: "none",
          gestureEnabled: false,
          contentStyle: {
            backgroundColor: colors.bg,
          },
        }}
      />

      <Stack.Screen
        name="detalle-historial"
        options={{
          headerShown: false,
          presentation: "card",
          animation: "none",
          gestureEnabled: false,
          contentStyle: {
            backgroundColor: colors.bg,
          },
        }}
      />
    </Stack>
  );
}