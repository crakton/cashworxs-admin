// Component Imports

// Server Action Imports
import OnboardingAdmin from '@/views/onboarding/OnboardingAdmin'
import { getServerMode } from '@core/utils/serverHelpers'

const OnboardingPage = () => {
  // Vars
  const mode = getServerMode()

  return <OnboardingAdmin />
}

export default OnboardingPage
