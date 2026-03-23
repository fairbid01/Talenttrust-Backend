import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 3001;

/* istanbul ignore next -- runtime bootstrap is exercised in process-level smoke tests */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TalentTrust API listening on http://localhost:${PORT}`);
  });
}

export default app;
