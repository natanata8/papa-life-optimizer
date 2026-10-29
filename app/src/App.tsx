import { StoreProvider } from '@/app/store.tsx'
import { Shell } from '@/components/Shell.tsx'

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
