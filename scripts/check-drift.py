#!/usr/bin/env python3
"""
check-drift.py — Convention drift detector（模板單 repo 版本）

檢查 NPT 模板專案是否符合 docs/backend/CONVENTIONS.md 的後端慣例：
  1. §5 baseline permissions — seed 必須包含的核心權限
  2. §1 — 禁用的 dead permissions（已廢棄的命名）
  3. §2.1/2.3 — single-target mutation/query 應該用 `id`
  4. §4 — resolver 不能硬編角色名
  5. §3.1 — PageInfo / 分頁 wrapper 欄位完整
  6. §3.2 — ActivityEvent 欄位完整（若有自訂 ActivityEvent type）

Exit code: 0 = 無違規；1 = 有違規（列印對照表）
"""
from __future__ import annotations

import re
import sys
from pathlib import Path


# ============================================================
# Repo detection
# ============================================================
def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


# ============================================================
# Convention constants（依 CONVENTIONS.md §5）
# ============================================================
# §5 baseline — 模板必須包含的權限
BASELINE_PERMS: dict[str, list[str]] = {
    'HQ_SCOPE': [
        'users:read', 'users:list',
        'users:create', 'users:update', 'users:delete',
        'roles:read', 'roles:manage',
        'audit-logs:read',
        'sessions:read', 'sessions:revoke',
        'cron_jobs:read', 'cron_jobs:write',
    ],
    'CUSTOMER_SCOPE': [
        'users:read', 'users:list',
    ],
}

# §1 — 已廢棄、不得復活的權限（命名違反 action-semantic 或 resolver 已不存在）
FORBIDDEN_PERMS: list[str] = [
    'profile:read', 'profile:update',  # dead — JwtAuthGuard only
    'permissions:manage',  # dead — no resolver
]

# §2.1/2.3 — 凡是 single-target 的 mutation/query 都應該用 `id`，不得用 `{X}Id`
# 命名表（resolver 名稱 → 違規 arg）。新增業務模組時請維護此表。
SINGLE_TARGET_VIOLATIONS: list[tuple[str, str]] = [
    # 模板尚無業務模組，此處留空。新增模組時依 CONVENTIONS §2 規則維護。
]

# §4 — resolver 不能硬編角色名（plugin / guard 框架層仍允許）
FORBIDDEN_ROLE_PATTERNS = [
    re.compile(
        r"roleNames\??\.includes\(['\"](MANAGER|MEMBER|OWNER|SUPER_HQ|CONTENT_EDITOR|VIEWER|GUEST)['\"]\)"
    ),
    re.compile(r"roles\?\.some\([^)]*roleNames"),
]

# §3.1
EXPECTED_PAGE_INFO_FIELDS = {
    'currentPage', 'totalPages', 'totalCount', 'limit',
    'hasNextPage', 'hasPreviousPage',
}

# §3.2 — 若有自訂 ActivityEvent，欄位必須統一
EXPECTED_ACTIVITY_EVENT_FIELDS = {'eventType', 'timestamp'}

# §3.1 已知分頁 wrapper 型別（必須有 data + pageInfo）
PAGINATION_WRAPPER_TYPES: list[str] = [
    'CronJobExecutionHistoryType',
]
EXPECTED_PAGINATION_WRAPPER_FIELDS = {'data', 'pageInfo'}

# §2.5 — delete mutation 回 Boolean。例外：批次 delete 回 Int（被刪除的數量）
DELETE_RETURNS_ENTITY_ALLOWED: set[str] = {
    'deleteReadNotifications',  # 批次（回 Int 數量）
}


# ============================================================
# Helpers
# ============================================================
def extract_perm_names(seed_text: str) -> set[str]:
    """Extract permission 'xxx:yyy' names from seed TS content."""
    return set(re.findall(r"name:\s*'([a-z_:\-][a-z_:\-0-9]*:[a-z_]+)'", seed_text))


def find_resolver_files(src: Path) -> list[Path]:
    if not src.exists():
        return []
    return [p for p in src.rglob('*.resolver.ts') if not p.name.endswith('.spec.ts')]


def find_ts_files(src: Path) -> list[Path]:
    if not src.exists():
        return []
    return [p for p in src.rglob('*.ts') if not p.name.endswith('.spec.ts')]


# ============================================================
# Checks
# ============================================================
def check_baseline_perms(seed: Path) -> list[str]:
    if not seed.is_file():
        return [f'seed 檔不存在: {seed}']
    text = seed.read_text(encoding='utf-8')
    found = extract_perm_names(text)
    missing: list[str] = []
    for scope, perms in BASELINE_PERMS.items():
        for p in perms:
            if p not in found:
                missing.append(f'缺 baseline perm: {p} ({scope})')
    return missing


def check_forbidden_perms(seed: Path) -> list[str]:
    if not seed.is_file():
        return []
    text = seed.read_text(encoding='utf-8')
    found = extract_perm_names(text)
    # base.ts 中為了清理舊資料庫權限，可能會把 forbidden perm 列在 deprecatedPermissionNames 陣列中。
    # 我們只在「實際註冊新權限」的 permissions 陣列發現時才警告——以 `name:` 鍵在 permissions 物件
    # 中的出現作為定義特徵。簡化判斷：只看是否仍以 `permissions: [...]` 形式註冊。
    perms_block_match = re.search(
        r'permissions:\s*Array<.*?>\s*=\s*\[(.+?)\];',
        text,
        flags=re.DOTALL,
    )
    if not perms_block_match:
        return []
    perms_block = perms_block_match.group(1)
    block_found = set(re.findall(r"name:\s*'([a-z_:\-][a-z_:\-0-9]*:[a-z_]+)'", perms_block))
    return [f'仍註冊已廢棄 perm: {p}' for p in FORBIDDEN_PERMS if p in block_found]


def check_single_target_args(src: Path) -> list[str]:
    findings: list[str] = []
    for f in find_resolver_files(src):
        text = f.read_text(encoding='utf-8')
        for resolver_name, bad_arg in SINGLE_TARGET_VIOLATIONS:
            pattern = re.compile(
                rf"async\s+{re.escape(resolver_name)}\s*\([^)]*@Args\(\s*['\"]{re.escape(bad_arg)}['\"]"
            )
            if pattern.search(text):
                findings.append(
                    f"{f.name}: {resolver_name} 應使用 @Args('id')，現在用 '{bad_arg}'"
                )
    return findings


def check_hardcoded_roles(src: Path) -> list[str]:
    findings: list[str] = []
    for f in find_resolver_files(src):
        text = f.read_text(encoding='utf-8')
        for pat in FORBIDDEN_ROLE_PATTERNS:
            if pat.search(text):
                findings.append(
                    f"{f.relative_to(src.parent.parent)}: resolver 內硬編角色名（{pat.pattern}）"
                )
                break
    return findings


def check_delete_return_types(src: Path) -> list[str]:
    findings: list[str] = []
    pattern = re.compile(
        r'@Mutation\(\(\)\s*=>\s*([A-Za-z][\w!\[\]]*)[^)]*\)\s*[^{]*?async\s+(delete\w+)\s*\(',
        re.DOTALL,
    )
    for f in find_resolver_files(src):
        text = f.read_text(encoding='utf-8')
        for m in pattern.finditer(text):
            return_type, method = m.group(1), m.group(2)
            if method in DELETE_RETURNS_ENTITY_ALLOWED:
                continue
            if return_type.replace('!', '').replace('[', '').replace(']', '') != 'Boolean':
                findings.append(
                    f"{f.name}: {method} 應回傳 Boolean（現為 {return_type}）"
                )
    return findings


def check_graphql_type_fields(
    type_name: str, expected_fields: set[str], src: Path,
) -> list[str]:
    """Verify a @ObjectType('TypeName') has all expected_fields."""
    findings: list[str] = []
    for f in find_ts_files(src):
        text = f.read_text(encoding='utf-8')
        # 找 ObjectType('TypeName') 標註的 class 主體
        match = re.search(
            rf"@ObjectType\(\s*['\"]{re.escape(type_name)}['\"][^)]*\)\s*export\s+class\s+\w+\s*\{{(.+?)^\}}",
            text,
            flags=re.DOTALL | re.MULTILINE,
        )
        if not match:
            continue
        body = match.group(1)
        for field in expected_fields:
            field_pattern = re.compile(
                rf"@Field\([^)]*\)\s*\n\s*{re.escape(field)}\s*[?:!]"
            )
            if not field_pattern.search(body):
                findings.append(
                    f"{f.name}: {type_name} 缺欄位 `{field}`"
                )
    return findings


def run_checks(root: Path) -> list[str]:
    seed = root / 'apps/backend/database/prisma/seeds/base.ts'
    src = root / 'apps/backend/src'
    findings: list[str] = []
    findings += check_baseline_perms(seed)
    findings += check_forbidden_perms(seed)
    findings += check_single_target_args(src)
    findings += check_hardcoded_roles(src)
    findings += check_delete_return_types(src)
    findings += check_graphql_type_fields(
        'PageInfo', EXPECTED_PAGE_INFO_FIELDS, src / 'common',
    )
    for wrapper in PAGINATION_WRAPPER_TYPES:
        findings += check_graphql_type_fields(
            wrapper, EXPECTED_PAGINATION_WRAPPER_FIELDS, src,
        )
    return findings


USAGE = """\
check-drift.py — NPT 模板 convention 檢查工具

Usage:
  ./scripts/cli.sh drift            # via CLI wrapper
  python3 scripts/check-drift.py    # direct invocation

Exit code:
  0  無違規
  1  發現違規（列印對照表）

詳見 docs/backend/CONVENTIONS.md
"""


def main() -> int:
    if any(arg in ('--help', '-h') for arg in sys.argv[1:]):
        print(USAGE)
        return 0
    root = repo_root()
    print(f'🔍 Convention check ({root.name})')
    print()

    findings = run_checks(root)
    if not findings:
        print(f'✓  {root.name}')
        print('\n🎉 無違規')
        return 0

    print(f'✗ {len(findings)} 項違規')
    print(f'\n{"━" * 60}')
    print(f'發現 {len(findings)} 個違規：')
    print(f'{"━" * 60}')
    for f in findings:
        print(f'  • {f}')
    print(f'\n📖 詳見 docs/backend/CONVENTIONS.md')
    return 1


if __name__ == '__main__':
    sys.exit(main())
