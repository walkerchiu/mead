import { ManualDnsOperator } from './manual-dns.operator';

describe('ManualDnsOperator', () => {
  it('writeTxt 不 throw（log only）', async () => {
    const op = new ManualDnsOperator();
    await expect(
      op.writeTxt('_acme-challenge.example.com', 'val'),
    ).resolves.toBeUndefined();
  });

  it('removeTxt 不 throw', async () => {
    const op = new ManualDnsOperator();
    await expect(
      op.removeTxt('_acme-challenge.example.com', 'val'),
    ).resolves.toBeUndefined();
  });

  it('testConnection 永遠回 ok', async () => {
    const op = new ManualDnsOperator();
    const out = await op.testConnection();
    expect(out.ok).toBe(true);
    expect(out.reason).toMatch(/manual/);
  });

  it('provider 為 manual', () => {
    expect(new ManualDnsOperator().provider).toBe('manual');
  });
});
