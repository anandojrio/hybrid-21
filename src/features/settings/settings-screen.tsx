import { format } from 'date-fns'
import { CircleAlert, Download, FileSpreadsheet, Smartphone, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useLogs } from '@/app/logs-store'
import { useMotionPreference } from '@/app/motion-preference'
import { Segmented } from '@/components/form-controls'
import { useRepositories } from '@/app/storage-provider'
import { ListGroup, ListRow } from '@/components/list-group'
import { ScreenHeader } from '@/components/screen-header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PLAN_START, RACE_DATE, PLANNED_SESSIONS } from '@/data/training-plan'
import {
  backupFileName,
  buildGymCsv,
  buildSessionsCsv,
  csvFileNames,
  parseBackup,
  serializeBackup,
  type Backup,
  type BackupSummary,
} from '@/db'
import { useBackupStatus } from '@/hooks/use-backup-status'
import { BACKUP_REMINDER_DAYS } from '@/lib/backup-reminder'
import { formatIsoDate } from '@/lib/dates'
import { saveFiles } from '@/lib/save-files'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

const formatStamp = (iso: string) => format(new Date(iso), 'MMM d, yyyy · HH:mm')

function isStandalone(): boolean {
  const nav = globalThis.navigator as Navigator & { standalone?: boolean }
  return Boolean(nav.standalone || globalThis.matchMedia?.('(display-mode: standalone)').matches)
}

type PersistState = 'granted' | 'not-granted' | 'unsupported' | 'unknown'

function usePersistState(): PersistState {
  const [state, setState] = useState<PersistState>(() =>
    typeof globalThis.navigator?.storage?.persisted === 'function' ? 'unknown' : 'unsupported',
  )
  useEffect(() => {
    const storage = globalThis.navigator?.storage
    if (!storage?.persisted) return
    storage
      .persisted()
      .then((p) => setState(p ? 'granted' : 'not-granted'))
      .catch(() => setState('unsupported'))
  }, [])
  return state
}

const PERSIST_LABEL: Record<PersistState, string> = {
  granted: 'Protected from automatic clean-up',
  'not-granted': 'Not guaranteed by the browser; keep backups',
  unsupported: 'Not reported by this browser; keep backups',
  unknown: 'Checking…',
}

/** Backup, restore, CSV export and app information. Data never leaves the device on its own. */
export default function SettingsScreen() {
  const { backup } = useRepositories()
  const { logs, checkIns, reload } = useLogs()
  const { lastBackupAt, reminderDue, markBackedUp } = useBackupStatus()
  const persist = usePersistState()
  const motion = useMotionPreference()
  const fileInput = useRef<HTMLInputElement>(null)

  const [busy, setBusy] = useState<'backup' | 'csv' | 'restore' | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [restoreErrors, setRestoreErrors] = useState<string[] | null>(null)
  const [pending, setPending] = useState<{ backup: Backup; summary: BackupSummary } | null>(null)
  const [restoreResult, setRestoreResult] = useState<string | null>(null)

  const exportBackup = async () => {
    setBusy('backup')
    setExportError(null)
    try {
      const now = new Date()
      const data = await backup.create(now)
      const saved = await saveFiles([
        { name: backupFileName(now), type: 'application/json', content: serializeBackup(data) },
      ])
      if (saved) {
        await markBackedUp(now.toISOString())
        toast.success('Backup exported')
      }
    } catch {
      setExportError('The backup could not be created. Nothing was changed; try again.')
    } finally {
      setBusy(null)
    }
  }

  const exportCsv = async () => {
    setBusy('csv')
    setExportError(null)
    try {
      const names = csvFileNames()
      const saved = await saveFiles([
        { name: names.sessions, type: 'text/csv', content: buildSessionsCsv(logs, checkIns) },
        { name: names.gym, type: 'text/csv', content: buildGymCsv(logs) },
      ])
      if (saved) toast.success('CSV exported')
    } catch {
      setExportError('The CSV files could not be created. Try again.')
    } finally {
      setBusy(null)
    }
  }

  const pickFile = async (file: File | undefined) => {
    setRestoreErrors(null)
    setRestoreResult(null)
    if (!file) return
    const parsed = parseBackup(await file.text())
    if (!parsed.ok) {
      setRestoreErrors(parsed.errors)
      return
    }
    setPending({ backup: parsed.backup, summary: parsed.summary })
  }

  const confirmRestore = async () => {
    if (!pending) return
    setBusy('restore')
    try {
      const result = await backup.restore(pending.backup)
      await reload()
      setRestoreResult(
        `Restored: ${result.added} added, ${result.updated} updated, ${result.unchanged} already up to date.`,
      )
    } catch {
      setRestoreErrors(['Restore failed. Nothing was changed on this device.'])
    } finally {
      setPending(null)
      setBusy(null)
    }
  }

  const s = pending?.summary

  return (
    <>
      <ScreenHeader title="Settings" variant="pushed" />

      <ListGroup
        title="Backup"
        footer={
          <>
            Your logs live only on this phone. Save a backup to Files or iCloud Drive regularly;
            deleting the app or clearing Safari data removes everything.
          </>
        }
      >
        <ListRow
          title="Last backup"
          trailing={lastBackupAt ? formatStamp(lastBackupAt) : 'Never'}
        />
        {reminderDue ? (
          <div role="note" className="flex items-start gap-2 px-4 py-3 text-(--status-modified-fg)">
            <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
            <p className="text-[15px]">No backup in the last {BACKUP_REMINDER_DAYS} days.</p>
          </div>
        ) : null}
        <ListRow
          leading={<Download aria-hidden className="text-theme-ink size-5" />}
          title={busy === 'backup' ? 'Preparing backup…' : 'Export backup (JSON)'}
          subtitle={`${logs.length} sessions · ${checkIns.length} check-ins`}
          onClick={busy ? undefined : () => void exportBackup()}
        />
        <ListRow
          leading={<Upload aria-hidden className="text-theme-ink size-5" />}
          title={busy === 'restore' ? 'Restoring…' : 'Restore from backup'}
          subtitle="Merges by ID; nothing is duplicated"
          onClick={busy ? undefined : () => fileInput.current?.click()}
        />
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Backup file"
          onChange={(e) => {
            void pickFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </ListGroup>

      {exportError || restoreErrors || restoreResult ? (
        <div
          role={restoreResult ? 'status' : 'alert'}
          className={
            restoreResult
              ? 'bg-surface text-ink rounded-(--radius-group) px-4 py-3 text-[15px]'
              : 'bg-surface text-danger rounded-(--radius-group) border border-(--danger)/40 px-4 py-3 text-[15px]'
          }
        >
          {restoreResult ?? exportError}
          {restoreErrors ? (
            <>
              <p className="font-semibold">This backup cannot be restored:</p>
              <ul className="mt-1 list-disc pl-5">
                {restoreErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}

      <ListGroup title="Export" footer="Two files: sessions.csv and gym-exercises.csv.">
        <ListRow
          leading={<FileSpreadsheet aria-hidden className="text-theme-ink size-5" />}
          title={busy === 'csv' ? 'Preparing CSV…' : 'Export logs as CSV'}
          onClick={busy ? undefined : () => void exportCsv()}
        />
      </ListGroup>

      <ListGroup
        title="Animations"
        footer="iPhone Reduce Motion turns animations off unless you choose Always on."
      >
        <div className="px-4 py-3">
          <Segmented
            label="Animations"
            value={motion.preference}
            options={[
              { value: 'system', label: 'Follow iPhone' },
              { value: 'always', label: 'Always on' },
            ]}
            onChange={motion.setPreference}
          />
        </div>
      </ListGroup>

      <ListGroup title="Storage">
        <ListRow title="Persistent storage" subtitle={PERSIST_LABEL[persist]} />
      </ListGroup>

      {isStandalone() ? null : (
        <ListGroup title="Install on iPhone">
          <ListRow
            leading={<Smartphone aria-hidden className="text-theme-ink size-5" />}
            title="Add to Home Screen"
            subtitle="Safari → Share → Add to Home Screen"
          />
        </ListGroup>
      )}

      <ListGroup title="About" footer="Planned sessions are read-only. Works offline.">
        <ListRow title="Hybrid 21" trailing="MVP" />
        <ListRow
          title="Plan"
          trailing={`${formatIsoDate(PLAN_START, 'MMM d')} – ${formatIsoDate(RACE_DATE, 'MMM d, yyyy')}`}
        />
        <ListRow title="Planned sessions" trailing={PLANNED_SESSIONS.length} />
      </ListGroup>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent className="bg-surface rounded-(--radius-group)">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this backup?</AlertDialogTitle>
            <AlertDialogDescription>
              {s
                ? `${plural(s.sessionLogs, 'session')} and ${plural(s.checkIns, 'check-in')}${
                    s.firstDate && s.lastDate
                      ? ` from ${formatIsoDate(s.firstDate, 'MMM d')} to ${formatIsoDate(s.lastDate, 'MMM d')}`
                      : ''
                  }, exported ${formatStamp(s.exportedAt)}. Matching records are merged; the newer edit wins.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="h-11 rounded-2xl" onClick={() => void confirmRestore()}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
