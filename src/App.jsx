import { Suspense } from "react";
import { LoadingSkeleton } from "./components/feedback/LoadingSkeleton";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingSkeleton />}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
