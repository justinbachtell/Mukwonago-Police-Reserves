import { defineConfig } from 'checkly';
import { EmailAlertChannel, Frequency } from 'checkly/constructs';

const sendDefaults = {
  sendDegraded: true,
  sendFailure: true,
  sendRecovery: true,
};

const productionURL = 'https://mukwonago-police-reserves.vercel.app';

const emailChannel = new EmailAlertChannel('email-channel-1', {
  address: process.env.EMAIL_ADDRESS || 'support@justinbachtell.com',
  ...sendDefaults,
});

export const config = defineConfig({
  checks: {
    browserChecks: {
      alertChannels: [emailChannel],
      frequency: Frequency.EVERY_24H,
      testMatch: '**/tests/e2e/**/*.check.e2e.ts',
    },
    locations: ['us-east-1', 'eu-west-1'],
    playwrightConfig: {
      use: {
        baseURL: process.env.ENVIRONMENT_URL || productionURL,
        extraHTTPHeaders: {
          'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN,
        },
      },
    },
    runtimeId: '2024.02',
    tags: ['website'],
  },
  cli: {
    reporters: ['list'],
    runLocation: 'eu-west-1',
  },
  logicalId: 'mukwonago-police-reserves',
  projectName: 'Mukwonago Police Reserves',
  repoUrl: 'https://github.com/justinbachtell/mukwonago-police-reserves',
});

export default config;
