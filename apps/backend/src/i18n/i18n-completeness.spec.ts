import * as fs from 'fs';
import * as path from 'path';

describe('i18n Translation Completeness', () => {
  const i18nDir = path.join(__dirname);
  const languages = ['en', 'zh-TW'];
  const namespaces = ['auth', 'common', 'email', 'twoFactor', 'validation'];

  // Helper function to get all keys from a nested object
  function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    let keys: string[] = [];

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        keys = keys.concat(
          getAllKeys(obj[key] as Record<string, unknown>, fullKey),
        );
      } else {
        keys.push(fullKey);
      }
    }

    return keys.sort();
  }

  // Helper function to load JSON file
  function loadTranslationFile(
    language: string,
    namespace: string,
  ): Record<string, unknown> {
    const filePath = path.join(i18nDir, language, `${namespace}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  describe('File existence', () => {
    languages.forEach((language) => {
      namespaces.forEach((namespace) => {
        it(`should have ${namespace}.json for ${language}`, () => {
          const filePath = path.join(i18nDir, language, `${namespace}.json`);
          expect(fs.existsSync(filePath)).toBe(true);
        });
      });
    });
  });

  describe('Translation key consistency', () => {
    namespaces.forEach((namespace) => {
      it(`should have the same keys in all languages for ${namespace}`, () => {
        const translations = languages.map((lang) =>
          loadTranslationFile(lang, namespace),
        );

        const keySets = translations.map((t) => getAllKeys(t));
        const referenceKeys = keySets[0];

        keySets.forEach((keys, index) => {
          const language = languages[index];

          // Check if all keys match
          expect(keys).toEqual(referenceKeys);

          // Additional detailed check
          const missingKeys = referenceKeys.filter((k) => !keys.includes(k));
          const extraKeys = keys.filter((k) => !referenceKeys.includes(k));

          if (missingKeys.length > 0) {
            console.error(
              `Missing keys in ${language}/${namespace}.json:`,
              missingKeys,
            );
          }
          if (extraKeys.length > 0) {
            console.error(
              `Extra keys in ${language}/${namespace}.json:`,
              extraKeys,
            );
          }
        });
      });
    });
  });

  describe('Translation value validation', () => {
    namespaces.forEach((namespace) => {
      languages.forEach((language) => {
        it(`should not have empty values in ${language}/${namespace}`, () => {
          const translation = loadTranslationFile(language, namespace);
          const keys = getAllKeys(translation);

          keys.forEach((key) => {
            const value = key
              .split('.')
              .reduce<unknown>(
                (obj, k) => (obj as Record<string, unknown>)[k],
                translation,
              );
            expect(value).toBeTruthy();
            expect(typeof value).toBe('string');
            expect((value as string).trim().length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('Placeholder consistency', () => {
    namespaces.forEach((namespace) => {
      it(`should have matching placeholders across languages in ${namespace}`, () => {
        const translations = languages.map((lang) =>
          loadTranslationFile(lang, namespace),
        );

        const referenceKeys = getAllKeys(translations[0]);

        referenceKeys.forEach((key) => {
          const values = translations.map((t) =>
            key
              .split('.')
              .reduce<unknown>(
                (obj, k) => (obj as Record<string, unknown>)[k],
                t,
              ),
          );

          // Extract placeholders like {variable}, {{variable}}, or $t(key)
          const placeholderPattern = /\{+[\w.]+\}+|\$t\([^)]+\)/g;
          const placeholderSets = values.map((v) => {
            const matches = (v as string).match(placeholderPattern);
            return matches ? matches.sort() : [];
          });

          // All languages should have the same placeholders
          const referencePlaceholders = placeholderSets[0];
          placeholderSets.forEach((placeholders, index) => {
            if (referencePlaceholders.length > 0 || placeholders.length > 0) {
              expect(placeholders).toEqual(referencePlaceholders);

              if (
                JSON.stringify(placeholders) !==
                JSON.stringify(referencePlaceholders)
              ) {
                console.error(
                  `Placeholder mismatch in ${languages[index]}/${namespace}.json for key "${key}":`,
                  { expected: referencePlaceholders, actual: placeholders },
                );
              }
            }
          });
        });
      });
    });
  });

  describe('JSON validity', () => {
    languages.forEach((language) => {
      namespaces.forEach((namespace) => {
        it(`should be valid JSON: ${language}/${namespace}.json`, () => {
          const filePath = path.join(i18nDir, language, `${namespace}.json`);
          const content = fs.readFileSync(filePath, 'utf-8');

          expect(() => {
            JSON.parse(content);
          }).not.toThrow();
        });
      });
    });
  });
});
