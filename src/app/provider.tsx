import { Provider } from "react-redux";
import { store } from "./store";
import { createContext, useState } from "react";
import type { ReactNode } from "react"; // ✅ type-only import
import type { GameTable } from "../api/admin";

export const TableDataContext = createContext<GameTable[] | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialTables?: GameTable[];
}

function AppProvider({ children, initialTables }: AppProviderProps) {
  const [tables] = useState<GameTable[] | undefined>(initialTables);

  return (
    <Provider store={store}>
      <TableDataContext.Provider value={tables}>{children}</TableDataContext.Provider>
    </Provider>
  );
}

export default AppProvider;
