import { NestFactory } from '@nestjs/core';
import { I18nGenerationModule } from './generate-i18n.module';

/**
 * Generates TypeScript types for i18n keys.
 * This script uses a minimal module that only includes i18n configuration
 * to avoid dependencies on other services like database or email.
 */
async function generate() {
  // Create a minimal NestJS application with only i18n
  const app = await NestFactory.create(I18nGenerationModule, {
    logger: ['error', 'warn'],
  });

  // The I18nModule will generate types on initialization
  await app.init();

  // Close the app to terminate the script
  await app.close();

  console.log('✅ i18n types generated successfully');
}

generate()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error generating i18n types:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
