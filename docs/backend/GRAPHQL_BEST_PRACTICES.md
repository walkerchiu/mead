# GraphQL 最佳實踐 (GraphQL Best Practices)

提升 GraphQL API 效能、安全性和可維護性的最佳實踐指南。

---

## 📋 目錄

- [GraphQL 最佳實踐 (GraphQL Best Practices)](#graphql-最佳實踐-graphql-best-practices)
  - [📋 目錄](#-目錄)
  - [🏗️ Schema 設計](#️-schema-設計)
    - [命名規範](#命名規範)
      - [✅ 使用 camelCase](#-使用-camelcase)
      - [✅ 型別名稱使用 PascalCase](#-型別名稱使用-pascalcase)
    - [使用明確的型別](#使用明確的型別)
      - [✅ 明確標示必填欄位](#-明確標示必填欄位)
      - [✅ 使用 Enum 而非字串](#-使用-enum-而非字串)
    - [Input Types vs Args](#input-types-vs-args)
      - [✅ 複雜輸入使用 Input Type](#-複雜輸入使用-input-type)
    - [分頁設計](#分頁設計)
      - [✅ 統一的分頁格式](#-統一的分頁格式)
  - [⚡ Query 最佳化](#-query-最佳化)
    - [避免過度查詢（Over-fetching）](#避免過度查詢over-fetching)
      - [✅ 只回傳需要的欄位](#-只回傳需要的欄位)
    - [解決 N+1 查詢問題](#解決-n1-查詢問題)
      - [❌ N+1 問題範例](#-n1-問題範例)
      - [✅ 使用 Prisma include](#-使用-prisma-include)
      - [✅ 使用 DataLoader（可選）](#-使用-dataloader可選)
    - [使用 Fragment 減少重複](#使用-fragment-減少重複)
  - [🚨 錯誤處理](#-錯誤處理)
    - [使用明確的錯誤代碼](#使用明確的錯誤代碼)
    - [驗證輸入](#驗證輸入)
  - [🔒 安全性](#-安全性)
    - [查詢深度限制](#查詢深度限制)
    - [查詢複雜度限制](#查詢複雜度限制)
    - [速率限制](#速率限制)
    - [欄位級別授權](#欄位級別授權)
  - [⚡ 效能優化](#-效能優化)
    - [使用快取](#使用快取)
    - [批次查詢](#批次查詢)
    - [選擇性查詢欄位](#選擇性查詢欄位)
  - [🧪 測試策略](#-測試策略)
    - [單元測試](#單元測試)
    - [E2E 測試](#e2e-測試)
  - [📚 相關文檔](#-相關文檔)

---

## 🏗️ Schema 設計

### 命名規範

#### ✅ 使用 camelCase

```graphql
# ✅ 好
type User {
  firstName: String!
  emailAddress: String!
  createdAt: DateTime!
}

# ❌ 差
type User {
  first_name: String!
  EmailAddress: String!
  created_at: DateTime!
}
```

#### ✅ 型別名稱使用 PascalCase

```graphql
# ✅ 好
type UserProfile {
  user: User!
}

input CreateUserInput {
  name: String!
}

# ❌ 差
type userProfile {
  user: User!
}
```

---

### 使用明確的型別

#### ✅ 明確標示必填欄位

```graphql
# ✅ 好：清楚標示必填與可選
type User {
  id: ID! # 必填
  email: String! # 必填
  name: String! # 必填
  avatar: String # 可選
  bio: String # 可選
}

# ❌ 差：全部都可選
type User {
  id: ID
  email: String
  name: String
}
```

#### ✅ 使用 Enum 而非字串

```typescript
// ✅ 好：使用 Enum
@ObjectType()
export class User {
  @Field(() => UserRole)
  role: UserRole;
}

@registerEnumType(UserRole, {
  name: 'UserRole',
  description: '用戶角色',
})
export enum UserRole {
  HQ = 'HQ',
  CUSTOMER = 'CUSTOMER',
}

// ❌ 差：使用字串
@Field(() => String)
role: string;  // 'hq' | 'customer' | ???
```

---

### Input Types vs Args

#### ✅ 複雜輸入使用 Input Type

```typescript
// ✅ 好：使用 Input Type
@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar?: string;
}

@Mutation(() => User)
createUser(@Args('input') input: CreateUserInput) {
  return this.userService.create(input);
}

// ❌ 差：過多個別參數
@Mutation(() => User)
createUser(
  @Args('email') email: string,
  @Args('password') password: string,
  @Args('name') name: string,
  @Args('avatar', { nullable: true }) avatar?: string,
) {
  // 參數太多，不易維護
}
```

---

### 分頁設計

#### ✅ 統一的分頁格式

```typescript
// ✅ 好：統一的分頁結構
@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  data: User[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;
}

@Query(() => PaginatedUsers)
users(@Args('pagination') pagination: PaginationInput) {
  return this.userService.findAllPaginated(pagination);
}
```

---

## ⚡ Query 最佳化

### 避免過度查詢（Over-fetching）

#### ✅ 只回傳需要的欄位

```graphql
# ✅ 好：只查詢需要的欄位
query {
  user(id: "123") {
    id
    name
    email
  }
}

# ❌ 差：查詢所有欄位
query {
  user(id: "123") {
    id
    email
    name
    avatar
    bio
    createdAt
    updatedAt
    deletedAt
    emailVerifiedAt
    # ... 更多不需要的欄位
  }
}
```

---

### 解決 N+1 查詢問題

#### ❌ N+1 問題範例

```typescript
// ❌ 差：每個 user 都會觸發一次資料庫查詢
@Resolver(() => User)
export class UserResolver {
  @ResolveField(() => [Post])
  async posts(@Parent() user: User) {
    // 如果有 100 個 users，會執行 100 次查詢！
    return this.prisma.post.findMany({
      where: { userId: user.id },
    });
  }
}
```

#### ✅ 使用 Prisma include

```typescript
// ✅ 好：使用 Prisma include 一次查詢
@Query(() => [User])
async users() {
  return this.prisma.user.findMany({
    include: {
      posts: true,  // 自動 JOIN，只執行一次查詢
    },
  });
}
```

#### ✅ 使用 DataLoader（可選）

```typescript
// ✅ 更好：使用 DataLoader 批次查詢
import DataLoader from 'dataloader';

@Injectable()
export class PostsLoader {
  private loader = new DataLoader<string, Post[]>(async (userIds) => {
    const posts = await this.prisma.post.findMany({
      where: { userId: { in: [...userIds] } },
    });

    // 按 userId 分組
    const postsByUser = userIds.map((id) =>
      posts.filter((post) => post.userId === id),
    );

    return postsByUser;
  });

  load(userId: string) {
    return this.loader.load(userId);
  }
}

@Resolver(() => User)
export class UserResolver {
  constructor(private postsLoader: PostsLoader) {}

  @ResolveField(() => [Post])
  async posts(@Parent() user: User) {
    return this.postsLoader.load(user.id);
  }
}
```

---

### 使用 Fragment 減少重複

```graphql
# ✅ 好：使用 Fragment
fragment UserInfo on User {
  id
  name
  email
  avatar
}

query {
  user(id: "123") {
    ...UserInfo
  }

  users(pagination: { page: 1, limit: 10 }) {
    data {
      ...UserInfo
    }
  }
}

# ❌ 差：重複定義欄位
query {
  user(id: "123") {
    id
    name
    email
    avatar
  }

  users(pagination: { page: 1, limit: 10 }) {
    data {
      id
      name
      email
      avatar
    }
  }
}
```

---

## 🚨 錯誤處理

### 使用明確的錯誤代碼

```typescript
// ✅ 好：明確的錯誤代碼
export enum ErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

throw new GraphQLError('用戶不存在', {
  extensions: {
    code: ErrorCode.NOT_FOUND,
    userId: id,
  },
});

// ❌ 差：通用錯誤
throw new Error('Something went wrong');
```

---

### 驗證輸入

```typescript
// ✅ 好：使用 class-validator
@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail({}, { message: 'Email 格式不正確' })
  email: string;

  @Field()
  @MinLength(8, { message: '密碼長度至少 8 個字元' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '密碼必須包含大小寫字母和數字',
  })
  password: string;

  @Field()
  @MinLength(2, { message: '名稱長度至少 2 個字元' })
  @MaxLength(50, { message: '名稱長度不能超過 50 個字元' })
  name: string;
}

// ❌ 差：沒有驗證
@InputType()
export class CreateUserInput {
  @Field()
  email: string; // 沒檢查格式

  @Field()
  password: string; // 沒有長度和強度要求

  @Field()
  name: string; // 可能是空字串
}
```

---

## 🔒 安全性

### 查詢深度限制

```typescript
// ✅ 好：限制查詢深度
import { GraphQLModule } from '@nestjs/graphql';
import depthLimit from 'graphql-depth-limit';

GraphQLModule.forRoot({
  validationRules: [
    depthLimit(5), // 最多 5 層嵌套
  ],
});

// 防止惡意查詢:
// query {
//   user {
//     posts {
//       author {
//         posts {
//           author {
//             posts {  // 無限嵌套
//               ...
```

---

### 查詢複雜度限制

```typescript
// ✅ 好：限制查詢複雜度
import { createComplexityLimitRule } from 'graphql-validation-complexity';

GraphQLModule.forRoot({
  validationRules: [
    createComplexityLimitRule(1000), // 最大複雜度 1000
  ],
});
```

---

### 速率限制

```typescript
// ✅ 好：使用 Rate Limiting
@UseGuards(RateLimitGuard)
@RateLimit({ limit: 100, ttl: 60 })  // 每分鐘 100 次
@Query(() => [User])
async users() {
  return this.userService.findAll();
}
```

---

### 欄位級別授權

```typescript
// ✅ 好：欄位級別權限控制
@Resolver(() => User)
export class UserResolver {
  @Query(() => User)
  @UseGuards(PermissionGuard)
  @RequiresPermission('users:read')
  async user(@Args('id') id: string) {
    return this.userService.findOne(id);
  }

  @ResolveField(() => String)
  email(@Parent() user: User, @Context() context) {
    // 只有本人或管理員可以看到 email
    if (context.user.id === user.id || context.user.role === 'HQ') {
      return user.email;
    }
    return null;
  }
}
```

---

## ⚡ 效能優化

### 使用快取

```typescript
// ✅ 好：快取常用查詢
@Injectable()
export class UserService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findOne(id: string) {
    const cacheKey = `user:${id}`;

    // 檢查快取
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // 查詢資料庫
    const user = await this.prisma.user.findUnique({ where: { id } });

    // 寫入快取（5 分鐘）
    if (user) {
      await this.cacheManager.set(cacheKey, user, 300000);
    }

    return user;
  }
}
```

---

### 批次查詢

```typescript
// ✅ 好：批次處理
@Query(() => [User])
async users(@Args('ids', { type: () => [ID] }) ids: string[]) {
  // 一次查詢多個 users
  return this.prisma.user.findMany({
    where: { id: { in: ids } },
  });
}

// ❌ 差：循環查詢
for (const id of ids) {
  await this.prisma.user.findUnique({ where: { id } });
}
```

---

### 選擇性查詢欄位

```typescript
// ✅ 好：只查詢需要的欄位
async findOne(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      // 不包含 password 等敏感欄位
    },
  });
}

// ❌ 差：查詢所有欄位
async findOne(id: string) {
  return this.prisma.user.findUnique({ where: { id } });
  // 包含所有欄位，甚至 password hash
}
```

---

## 🧪 測試策略

### 單元測試

```typescript
describe('UserResolver', () => {
  let resolver: UserResolver;
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    service = module.get<UserService>(UserService);
  });

  it('should return a user', async () => {
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' };
    jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);

    const result = await resolver.user('1');

    expect(result).toEqual(mockUser);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });
});
```

---

### E2E 測試

```typescript
describe('GraphQL (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should query user', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            user(id: "1") {
              id
              name
              email
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.id).toBe('1');
      });
  });
});
```

---

## 📚 相關文檔

- [FIELD_AUTHORIZATION.md](../authentication/FIELD_AUTHORIZATION.md) - 欄位權限控制
- [API_RESPONSE_FORMAT.md](./API_RESPONSE_FORMAT.md) - API 回應格式
- [PAGINATION_GUIDE.md](./PAGINATION_GUIDE.md) - 分頁實現
- [RATE_LIMITING.md](../authentication/RATE_LIMITING.md) - 速率限制
