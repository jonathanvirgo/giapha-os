'use client'

import { ArrowUpCircle, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  getMigrationStatus,
  runPendingMigrations,
  type MigrationStatus
} from '@/app/actions/migrations'
import {
  DatabaseStatusCard,
  PendingMigrationsPanel,
  SourceStatusCard,
  SystemUpdatedPanel,
  UnavailablePanel
} from '@/components/upgrade/UpgradePanels'
import { useI18n } from '@/lib/i18n/useI18n'

export default function UpgradeManager({
  initialStatus
}: {
  initialStatus: MigrationStatus
}) {
  const { t } = useI18n()
  const [status, setStatus] = useState(initialStatus)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const pendingMigrations = useMemo(
    () =>
      status.databaseReachable
        ? status.migrations.filter((migration) => !migration.appliedAt)
        : [],
    [status.databaseReachable, status.migrations]
  )
  const hasPendingMigrations = pendingMigrations.length > 0
  const sourceNeedsUpdate = status.source.state !== 'current'
  const canRunMigrations =
    hasPendingMigrations &&
    status.configured &&
    status.databaseReachable &&
    !sourceNeedsUpdate

  const refreshStatus = async () => {
    setIsRefreshing(true)
    setMessage(null)
    try {
      setStatus(await getMigrationStatus())
    } catch {
      setMessage(t('upgradeRefreshError'))
    } finally {
      setIsRefreshing(false)
    }
  }

  const runMigrations = async () => {
    if (!canRunMigrations) return

    setIsRunning(true)
    setMessage(null)
    try {
      const result = await runPendingMigrations()
      setMessage(
        result.success
          ? result.message || t('databaseUpdated')
          : result.error || t('databaseUpdateError')
      )
      setStatus(await getMigrationStatus())
    } catch {
      setMessage(t('databaseUpdateFailed'))
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className='space-y-5'>
      <section className='rounded-2xl border border-stone-200/60 bg-white/70 p-5 backdrop-blur-xl sm:p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex items-start gap-3'>
            <div className='rounded-xl bg-amber-50 p-2.5 text-amber-700'>
              <ArrowUpCircle className='size-5' />
            </div>
            <div>
              <h2 className='font-serif text-xl font-semibold text-stone-900'>
                {t('upgradeCheckTitle')}
              </h2>
              <p className='mt-1 max-w-2xl text-sm text-stone-500'>
                {t('upgradeCheckDescription')}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={refreshStatus}
            disabled={isRefreshing || isRunning}
            className='btn self-start whitespace-nowrap disabled:cursor-wait disabled:opacity-60'>
            <RefreshCw
              className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {t('checkAgain')}
          </button>
        </div>
      </section>

      <div className='grid gap-4 md:grid-cols-2'>
        <SourceStatusCard
          status={status}
          sourceNeedsUpdate={sourceNeedsUpdate}
        />
        <DatabaseStatusCard status={status} />
      </div>

      {message && (
        <div className='rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700'>
          {message}
        </div>
      )}

      {!status.databaseReachable ? (
        <UnavailablePanel status={status} />
      ) : hasPendingMigrations ? (
        <PendingMigrationsPanel
          pendingMigrations={pendingMigrations}
          sourceNeedsUpdate={sourceNeedsUpdate}
          isRunning={isRunning}
          isRefreshing={isRefreshing}
          onRun={runMigrations}
        />
      ) : (
        <SystemUpdatedPanel />
      )}
    </div>
  )
}
