import {
  extractTokens,
  extractEmailTokens,
  extractNameTokens,
  normalizePassword,
  reverseString,
  containsAnyToken,
} from './password-similarity';

describe('Password Similarity Utilities', () => {
  describe('extractTokens', () => {
    it('should extract tokens from text with various delimiters', () => {
      expect(extractTokens('john.smith')).toEqual(['john', 'smith']);
      expect(extractTokens('alice_wonderland')).toEqual([
        'alice',
        'wonderland',
      ]);
      expect(extractTokens('bob-builder')).toEqual(['bob', 'builder']);
      expect(extractTokens('John Smith')).toEqual(['john', 'smith']);
    });

    it('should filter out tokens shorter than 3 characters', () => {
      expect(extractTokens('a.bc.def')).toEqual(['def']);
      expect(extractTokens('j.smith')).toEqual(['smith']);
    });

    it('should remove duplicates', () => {
      expect(extractTokens('john.john')).toEqual(['john']);
    });

    it('should handle empty or invalid input', () => {
      expect(extractTokens('')).toEqual([]);
      expect(extractTokens('ab')).toEqual([]);
    });
  });

  describe('extractEmailTokens', () => {
    it('should extract tokens from email username (default behavior)', () => {
      expect(extractEmailTokens('john.smith@example.com')).toEqual([
        'john',
        'smith',
      ]);
      expect(extractEmailTokens('alice_wonderland@company.co.uk')).toEqual([
        'alice',
        'wonderland',
      ]);
    });

    it('should ignore domain part by default', () => {
      expect(extractEmailTokens('bob@longdomainname.com')).toEqual(['bob']);
      expect(extractEmailTokens('alice@techcorp.com')).toEqual(['alice']);
    });

    it('should include domain tokens when includeDomain=true', () => {
      expect(extractEmailTokens('john@techcorp.com', true)).toEqual([
        'john',
        'techcorp',
      ]);
      expect(extractEmailTokens('alice@mycompany.co.uk', true)).toEqual([
        'alice',
        'mycompany',
      ]);
    });

    it('should handle common email providers correctly', () => {
      // 即使 includeDomain=true，也只提取網域名稱（不含 .com）
      expect(extractEmailTokens('user@gmail.com', true)).toEqual([
        'user',
        'gmail',
      ]);
      expect(extractEmailTokens('user@outlook.com', true)).toEqual([
        'user',
        'outlook',
      ]);
    });
  });

  describe('extractNameTokens', () => {
    it('should extract tokens from full names', () => {
      expect(extractNameTokens('John Smith')).toEqual(['john', 'smith']);
      expect(extractNameTokens('Alice Wonderland')).toEqual([
        'alice',
        'wonderland',
      ]);
    });

    it('should handle single names', () => {
      expect(extractNameTokens('Alice')).toEqual(['alice']);
    });

    it('should handle names with special characters', () => {
      expect(extractNameTokens("O'Brien")).toEqual(['brien']);
      expect(extractNameTokens('Jean-Claude')).toEqual(['jean', 'claude']);
    });
  });

  describe('normalizePassword', () => {
    it('should replace common leet speak substitutions', () => {
      expect(normalizePassword('P4ssw0rd')).toBe('password');
      expect(normalizePassword('J0hn')).toBe('john');
      expect(normalizePassword('4l1c3')).toBe('alice');
    });

    it('should handle @ and $ symbols', () => {
      expect(normalizePassword('P@ssw0rd')).toBe('password');
      expect(normalizePassword('$m1th')).toBe('smith');
    });

    it('should convert to lowercase', () => {
      expect(normalizePassword('JoHn')).toBe('john');
    });
  });

  describe('reverseString', () => {
    it('should reverse strings correctly', () => {
      expect(reverseString('john')).toBe('nhoj');
      expect(reverseString('Alice')).toBe('ecilA');
    });
  });

  describe('containsAnyToken', () => {
    it('should detect exact matches (case-insensitive)', () => {
      expect(containsAnyToken('MyJohn123', ['john'])).toBe(true);
      expect(containsAnyToken('myJOHN123', ['john'])).toBe(true);
      expect(containsAnyToken('Smith@2024', ['smith'])).toBe(true);
    });

    it('should detect leet speak variations', () => {
      expect(containsAnyToken('MyJ0hn123', ['john'])).toBe(true);
      expect(containsAnyToken('4l1c3@2024', ['alice'])).toBe(true);
      expect(containsAnyToken('$m1th!99', ['smith'])).toBe(true);
    });

    it('should detect reversed tokens', () => {
      expect(containsAnyToken('MyNhoj123', ['john'])).toBe(true);
      expect(containsAnyToken('ecilA@2024', ['alice'])).toBe(true);
    });

    it('should detect reversed + leet speak', () => {
      expect(containsAnyToken('MyNh0j123', ['john'])).toBe(true);
      expect(containsAnyToken('3c1l4@2024', ['alice'])).toBe(true);
    });

    it('should NOT match if no token is present', () => {
      expect(containsAnyToken('RandomPass123!', ['john'])).toBe(false);
      expect(containsAnyToken('ComplexPwd@2024', ['alice', 'smith'])).toBe(
        false,
      );
    });

    it('should handle multiple tokens and match any', () => {
      expect(containsAnyToken('MyJohn123', ['john', 'smith'])).toBe(true);
      expect(containsAnyToken('Smith@2024', ['john', 'smith'])).toBe(true);
      expect(containsAnyToken('RandomPass!', ['john', 'smith'])).toBe(false);
    });

    it('should handle empty token list', () => {
      expect(containsAnyToken('MyPassword123', [])).toBe(false);
    });
  });

  describe('Real-world Examples', () => {
    describe('Email: john.smith@example.com (without domain check)', () => {
      const emailTokens = extractEmailTokens('john.smith@example.com');

      it('should reject passwords containing email parts', () => {
        // 直接包含
        expect(containsAnyToken('MyJohn123!', emailTokens)).toBe(true);
        expect(containsAnyToken('Smith@2024', emailTokens)).toBe(true);

        // Leet speak
        expect(containsAnyToken('J0hn@2024!', emailTokens)).toBe(true);
        expect(containsAnyToken('$m1th!99', emailTokens)).toBe(true);

        // 反轉
        expect(containsAnyToken('MyNhoj@99', emailTokens)).toBe(true);
        expect(containsAnyToken('htimS!2024', emailTokens)).toBe(true);
      });

      it('should accept passwords NOT containing email parts', () => {
        expect(containsAnyToken('ComplexPwd@2024!', emailTokens)).toBe(false);
        expect(containsAnyToken('MyS3cur3P4ss!', emailTokens)).toBe(false);
      });
    });

    describe('Email: user@techcorp.com (with domain check)', () => {
      const emailTokensWithDomain = extractEmailTokens(
        'user@techcorp.com',
        true,
      );

      it('should reject passwords containing domain name', () => {
        // 檢查網域名稱
        expect(containsAnyToken('MyTechcorp123!', emailTokensWithDomain)).toBe(
          true,
        );
        expect(containsAnyToken('T3chc0rp@2024', emailTokensWithDomain)).toBe(
          true,
        );
        expect(containsAnyToken('prochceT!99', emailTokensWithDomain)).toBe(
          true,
        ); // reversed
      });

      it('should still check username part', () => {
        expect(containsAnyToken('MyUser123!', emailTokensWithDomain)).toBe(
          true,
        );
        expect(containsAnyToken('Us3r@2024', emailTokensWithDomain)).toBe(true);
      });

      it('should accept passwords without email tokens', () => {
        expect(
          containsAnyToken('ComplexPwd@2024!', emailTokensWithDomain),
        ).toBe(false);
      });
    });

    describe('Name: Alice Wonderland', () => {
      const nameTokens = extractNameTokens('Alice Wonderland');

      it('should reject passwords containing name parts', () => {
        // 直接包含
        expect(containsAnyToken('MyAlice123!', nameTokens)).toBe(true);
        expect(containsAnyToken('Wonderland@2024', nameTokens)).toBe(true);

        // Leet speak
        expect(containsAnyToken('4l1c3@2024', nameTokens)).toBe(true);
        expect(containsAnyToken('W0nd3rl4nd!99', nameTokens)).toBe(true);

        // 反轉
        expect(containsAnyToken('ecilA@99', nameTokens)).toBe(true);
        expect(containsAnyToken('dnalrednow!2024', nameTokens)).toBe(true);
      });

      it('should accept passwords NOT containing name parts', () => {
        expect(containsAnyToken('ComplexPwd@2024!', nameTokens)).toBe(false);
        expect(containsAnyToken('MyS3cur3P4ss!', nameTokens)).toBe(false);
      });
    });
  });
});
