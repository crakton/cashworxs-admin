// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'

// Component Imports
import UpgradeToProButton from '@components/upgrade-to-pro-button'

// Util Imports
import { getMode, getSettingsFromCookie } from '@core/utils/serverHelpers'
import ReduxProvider from './ReduxProvider'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = (props: Props) => {
  // Props
  const { children, direction } = props

  // Vars
  const mode = getMode()
  const settingsCookie = getSettingsFromCookie()

  return (
    <ReduxProvider>
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
          <ThemeProvider direction={direction}>{children}</ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </ReduxProvider>
  )
}

export default Providers
