/**
 * i18n Translation Completeness Tests
 *
 * This test suite ensures that all translation files are complete and consistent
 * across all supported languages.
 */

import { describe, it, expect } from 'vitest';
import enMessages from '../messages/en.json';
import zhTWMessages from '../messages/zh-TW.json';

describe('i18n Translation Completeness', () => {
  const translations = {
    en: enMessages,
    'zh-TW': zhTWMessages,
  };

  const languages = Object.keys(translations);

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

  describe('Translation key consistency', () => {
    it('should have the same keys in all languages', () => {
      const keySets = languages.map((lang) =>
        getAllKeys(translations[lang as keyof typeof translations]),
      );
      const referenceKeys = keySets[0];

      keySets.forEach((keys, index) => {
        const language = languages[index];

        // Check if all keys match
        expect(keys).toEqual(referenceKeys);

        // Additional detailed check
        const missingKeys = referenceKeys.filter((k) => !keys.includes(k));
        const extraKeys = keys.filter((k) => !referenceKeys.includes(k));

        if (missingKeys.length > 0) {
          console.error(`Missing keys in ${language}.json:`, missingKeys);
        }
        if (extraKeys.length > 0) {
          console.error(`Extra keys in ${language}.json:`, extraKeys);
        }
      });
    });
  });

  describe('Translation value validation', () => {
    languages.forEach((language) => {
      it(`should not have empty values in ${language}`, () => {
        const translation = translations[language as keyof typeof translations];
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
          expect((value as unknown as string).trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Placeholder consistency', () => {
    it('should have matching placeholders across languages', () => {
      const referenceKeys = getAllKeys(translations.en);

      referenceKeys.forEach((key) => {
        const values = languages.map((lang) =>
          key
            .split('.')
            .reduce<unknown>(
              (obj, k) => (obj as Record<string, unknown>)[k],
              translations[lang as keyof typeof translations],
            ),
        );

        // Extract placeholders like {variable}
        const placeholderPattern = /\{[\w.]+\}/g;
        const placeholderSets = values.map((v) => {
          const matches = (v as unknown as string).match(placeholderPattern);
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
                `Placeholder mismatch in ${languages[index]}.json for key "${key}":`,
                { expected: referencePlaceholders, actual: placeholders },
              );
            }
          }
        });
      });
    });
  });

  describe('Namespace structure', () => {
    const expectedNamespaces = ['common', 'nav', 'auth', 'validation', 'pages'];

    languages.forEach((language) => {
      it(`should have all expected namespaces in ${language}`, () => {
        const translation = translations[language as keyof typeof translations];
        const topLevelKeys = Object.keys(translation).sort();

        expectedNamespaces.forEach((namespace) => {
          expect(topLevelKeys).toContain(namespace);
        });
      });
    });
  });

  describe('Auth namespace completeness', () => {
    const expectedAuthSections = [
      'login',
      'forgotPassword',
      'resetPassword',
      'twoFactor',
    ];

    languages.forEach((language) => {
      it(`should have all auth sections in ${language}`, () => {
        const translation = translations[language as keyof typeof translations];
        const authKeys = Object.keys(translation.auth || {}).sort();

        expectedAuthSections.forEach((section) => {
          expect(authKeys).toContain(section);
        });
      });
    });
  });

  describe('Translation statistics', () => {
    it('should report translation coverage', () => {
      languages.forEach((language) => {
        const translation = translations[language as keyof typeof translations];
        const keys = getAllKeys(translation);
        console.log(`${language}: ${keys.length} translation keys`);
      });
    });
  });
});
