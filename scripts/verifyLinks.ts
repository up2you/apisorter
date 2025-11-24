import 'dotenv/config';

import { runLinkChecker } from '@/lib/linkChecker';

async function main() {
  const results = await runLinkChecker({ sendNotifications: false });
  for (const result of results) {
    if (result.status === 'error') {
      console.error('[verifyLinks] ❌', result.name, result.error ?? 'Unknown error');
    } else if (result.status === 'hash_changed') {
      console.warn('[verifyLinks] ⚠️', result.name, 'content hash changed');
    } else if (result.status === 'redirected') {
      console.info('[verifyLinks] ↪️', result.name, 'redirected to', result.newUrl);
    } else {
      console.log('[verifyLinks] ✅', result.name);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[verifyLinks] failed', error);
    process.exit(1);
  });





