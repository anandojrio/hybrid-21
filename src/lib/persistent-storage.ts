export type PersistResult = 'granted' | 'denied' | 'unsupported'

/**
 * Asks the browser to keep IndexedDB data under storage pressure. Safari may still refuse;
 * the app never assumes it was granted, which is why backups exist.
 */
export async function requestPersistentStorage(
  storage: StorageManager | undefined = globalThis.navigator?.storage,
): Promise<PersistResult> {
  if (!storage?.persist) return 'unsupported'
  try {
    if (await storage.persisted?.()) return 'granted'
    return (await storage.persist()) ? 'granted' : 'denied'
  } catch {
    return 'denied'
  }
}
