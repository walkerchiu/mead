/**
 * Commitlint configuration
 *
 * Format: <Type>(<Scope>): <Subject>
 *
 * - Type and Scope must start with uppercase
 * - Subject must start with uppercase verb (imperative mood)
 * - No period at the end of Subject
 */
export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: 'conventional-changelog-conventionalcommits',
  rules: {
    // Body rules
    'body-case': [2, 'always', 'sentence-case'],
    'body-full-stop': [2, 'always', '.'],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],

    // Footer rules
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],

    // Header rules
    'header-max-length': [2, 'always', 100],

    // Subject rules
    'subject-case': [2, 'always', ['sentence-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    // Type rules
    'type-case': [2, 'always', 'sentence-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'Build',
        'Chore',
        'CI',
        'Deprecate',
        'Docs',
        'Feat',
        'Fix',
        'Perf',
        'Refactor',
        'Release',
        'Revert',
        'Style',
        'Test',
      ],
    ],

    // Scope rules
    'scope-case': [2, 'always', 'sentence-case'],
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      [
        'API',
        'Config',
        'Framework',
        'Function',
        'Git',
        'Infra',
        'Lang',
        'Module',
        'Project',
        'Theme',
        'Vendor',
        'Views',
      ],
    ],
  },
  helpUrl: '',
};
