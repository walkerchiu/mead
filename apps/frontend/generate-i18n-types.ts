/**
 * Generate TypeScript types from i18n translation files
 * This script creates type definitions for next-intl based on the English translation file
 */

import * as fs from 'fs';
import * as path from 'path';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

/**
 * Convert translation object to TypeScript interface
 */
function generateInterface(obj: TranslationObject, indentLevel = 0): string {
  const indent = '  '.repeat(indentLevel);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      lines.push(`${indent}  ${key}: string;`);
    } else {
      lines.push(`${indent}  ${key}: {`);
      lines.push(generateInterface(value, indentLevel + 1));
      lines.push(`${indent}  };`);
    }
  }

  return lines.join('\n');
}

/**
 * Main function to generate types
 */
async function generateTypes(): Promise<void> {
  try {
    // Read English translation file as the source of truth
    const messagesPath = path.join(process.cwd(), 'messages', 'en.json');
    const content = fs.readFileSync(messagesPath, 'utf-8');
    const translations: TranslationObject = JSON.parse(content);

    // Generate TypeScript interface
    const typeDefinition = `// Auto-generated file. Do not edit manually.
// Generated from messages/en.json

export interface Messages {
${generateInterface(translations)}
}

declare global {
  interface IntlMessages extends Messages {}
}
`;

    // Write to types file
    const outputPath = path.join(
      process.cwd(),
      'src',
      'types',
      'i18n.generated.ts',
    );

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, typeDefinition, 'utf-8');

    console.log('✅ i18n types generated successfully');
    console.log(`   Output: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate i18n types:', error);
    process.exit(1);
  }
}

// Run the script
generateTypes();
