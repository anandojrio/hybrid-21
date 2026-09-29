import {
  BicepsFlexed,
  Dumbbell,
  Goal,
  Medal,
  Rotate3d,
  Route,
  Snowflake,
  SportShoe,
  Weight,
  type LucideIcon,
} from 'lucide-react'
import type { SessionStatus, SessionType } from '../domain/types'

export interface SessionTypeMeta {
  type: SessionType
  /** Uppercase badge text. */
  slug: string
  label: string
  icon: LucideIcon
  /** CSS custom properties from src/styles/tokens.css. */
  color: string
  foreground: string
}

const meta = (
  type: SessionType,
  label: string,
  icon: LucideIcon,
  slug = type.toUpperCase(),
): SessionTypeMeta => ({
  type,
  slug,
  label,
  icon,
  color: `var(--type-${type})`,
  foreground: `var(--type-${type}-fg)`,
})

/** Lucide has no ice-hockey icon; ICE uses a snowflake as a simple stand-in. */
export const SESSION_TYPE_META: Record<SessionType, SessionTypeMeta> = {
  leg: meta('leg', 'Leg strength', Weight),
  run: meta('run', 'Run', SportShoe),
  long: meta('long', 'Long run', Route),
  ice: meta('ice', 'Ice hockey', Snowflake),
  push: meta('push', 'Push: chest, biceps, front shoulder', BicepsFlexed),
  pull: meta('pull', 'Pull: back, triceps, rear shoulder', Dumbbell),
  mob: meta('mob', 'Mobility and core', Rotate3d),
  soc: meta('soc', 'Football (optional)', Goal, 'JOGA'),
  race: meta('race', 'Half-marathon', Medal),
}

export const STATUS_LABEL: Record<SessionStatus, string> = {
  planned: 'Planned',
  completed: 'Completed',
  modified: 'Modified',
  skipped: 'Skipped',
}
