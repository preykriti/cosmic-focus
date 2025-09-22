export const colors = {
  light: {
    primary: "#6366F1", 
    secondary: "#8B5CF6", 
    accent: "#06B6D4", 
    background: "#ffffff80",
    surface: "#F8FAFC",
    card: "#FFFFFF",
    text: "#1E293B",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    
    // gradientStart: "#6366F1",
    gradientStart: "#7863f1ff",

    gradientEnd: "#8B5CF6",
  },
  
  dark: {
    primary: "#818CF8", 
    secondary: "#A78BFA", 
    accent: "#22D3EE",
    background: "#0F172A",
    surface: "#1E293B",
    card: "#334155",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    border: "#475569",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    // Gradient colors
    gradientStart: "#818CF8",
    gradientEnd: "#A78BFA",
  },
  
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
 
  star: "#FFD700",
  deadStar: "#6B7280",
  blackHole: "#1F2937",
}

export type ColorScheme = "light" | "dark"
export type Colors = typeof colors.light