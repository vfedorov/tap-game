import { createContext, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from './auth.store';
import { roundsStore } from './rounds.store';

const stores = {
  authStore,
  roundsStore,
};

const StoreContext = createContext(stores);

export const useStores = () => useContext(StoreContext);

export const StoreProvider = observer(({ children }: { children: React.ReactNode }) => {
  return <StoreContext.Provider value={stores}>{children}</StoreContext.Provider>;
});
