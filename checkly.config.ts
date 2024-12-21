import { defineConfig } from 'checkly';
import { EmailAlertChannel, Frequency } from 'checkly/constructs';

const sendDefaults = {
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: true,
};

const productionURL = 'https://mukwonago-police-reserves.vercel.app';

const emailChannel = new EmailAlertChannel('email-channel-1', {
  address: process.env.EMAIL_ADDRESS || 'support@justinbachtell.com',
  ...sendDefaults,
});

export const config = defineConfig({
  projectName: 'Mukwonago Police Reserves',
  logicalId: 'mukwonago-police-reserves',
  repoUrl: 'https://github.com/justinbachtell/mukwonago-police-reserves',
  checks: {
    locations: ['us-east-1', 'eu-west-1'],
    tags: ['website'],
    runtimeId: '2024.02',
    browserChecks: {
      frequency: Frequency.EVERY_24H,
      testMatch: '**/tests/e2e/**/*.check.e2e.ts',
      alertChannels: [emailChannel],
    },
    playwrightConfig: {
      use: {
        baseURL: process.env.ENVIRONMENT_URL || productionURL,
        extraHTTPHeaders: {
          'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN,
        },
      },
    },
  },
  cli: {
    runLocation: 'eu-west-1',
    reporters: ['list'],
  },
});

export default config;
