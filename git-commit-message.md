# Git Commit Message

Git Commit Message.

## 緣由

多人協作的專案裡，一個良好的 Commit 必須讓團隊成員快速知道提交者做了哪些事，包含可能會影響的範圍以及需要做哪些事來對應這個變更。

這樣的好處不僅有利於團隊維護，也有助於對 Git History 做更多自動化的應用。

故此，我們需要一個清楚的提交規範。這個規範在業界並不統一，很多團隊或專案都有自己的準則，並且也會隨著需求不斷更迭，但還是有一定的架構供我們參考。

## 簡介

Commit Message 主要由以下三個區塊組成：

1. Header（必填）
   - 由 Type、Scope 和 Subject 組成。
   - 簡單說明 Commit Message 的主旨。
2. Body
   - 選填。
   - 條列本次 Commit 做了哪些事。
3. Footer
   - 選填。
   - 說明需要做哪些相應的變更來採用本次 Commit。
   - 提供可供參考的連結。
   - 標註對應的 Issue Key。

格式如下：

```shell
<Type>(<Scope>): <Subject>

<Optional Body>

<Optional Footer>


<Type>(<Scope>)!: <Subject>

<Optional Body>

<Optional Footer>
```

其中必須注意：

1. Type、Scope、Subject、Body、Footer 皆以大寫字母開頭。
2. Header 中的符號使用半形表示。
3. Subject 使用祈使句，沒有主語，結尾也不帶符號。
4. Body 的前後應有一個空行。
5. Body 與 Footer 條列方式須遵守：
   - 以阿拉伯數字開頭，並以「. 」符號做為和描述的分隔。
   - 每列也須以「.」符號作為結尾。
   - 以重要度優先排序，如無法區分，則依照首字英文字母順序由上至下排列。
6. Body 與 Footer 中的描述必須以「.」符號作為結尾。
7. Footer 應該用以下任一字樣作為開頭，且如果同時存在，順序如下：
   - BREAKING CHANGE:
     - 若有重大變更，應以「BREAKING CHANGE:」字樣開頭，並於其上空一行，意即與 Body 空兩行。
     - 也應該在「\<Type>(\<Scope>):」之後加上「!」便於直接識別。
   - Note:
     - 備忘說明。
   - Reference:
     - 記錄參考資料，如技術手冊、議題連結等。
8. 不使用顏文字或表情符號。
9. 禁止添加 Co-Authored-By、Signed-off-by 或任何 AI 工具標記。

### 允許的 Type

1. Build
   - 和建立服務或持續部署有關的變更。
   - 如：編譯、打包、部署腳本… 等。
2. Chore
   - 無法歸類的瑣事。
3. CI
   - 和持續整合有關的變更。
4. Deprecate
   - 關閉既有的功能、模組或文字訊息。
5. Docs
   - 文件或註釋的變更。
6. Feat
   - 新增、變更或移除功能、視圖。
7. Fix
   - 修正已知的問題。
8. Perf
   - 改善效能。
9. Refactor
   - 重構。對輸出和輸入沒有影響的變更。
10. Release
    - 用於發布新版本，如 Release Notes。
11. Test
    - 和測試案例有關的變動。
12. Revert
    - 退回到 Git 上的某個版本。
    - 格式為「Revert: \<Header>」。
13. Style
    - 和 Coding Style 有關的變更。例如縮排、空格、標點符號、註解風格。
    - 無關服務外觀樣式。

### 允許的 Scope

1. API
   - 變更 API 的交換內容或方法。
2. Config
   - 變更設定檔。
3. Framework
   - 變更所用的程式框架。
   - 如：更新專案目錄或 Laravel、Next.js、Nest.js、Flutter… 等。
4. Function
   - 變更某個功能。
5. Git
   - 和部署有關的變更。
   - 如規範、協作方式… 等。
6. Infra
   - 和部署有關的變更。
   - 如 IaC… 等。
7. Lang
   - 和語系有關的變更。
8. Module
   - 變更模組。
   - 如：數個相關的功能或更抽象的上層控制區塊… 等。
9. Project
   - 比 Module 更上層的範疇。
   - 如：目錄結構。
10. Theme
    - 變更外觀風格樣式。
    - 如 CSS… 等。
11. Vendor
    - 升級、移除、更換或覆寫第三方套件。
12. Views
    - 變更畫面編排。
    - 如 HTML、Image… 等。

### 約定俗成的 Subject

1. Subject 以現在簡單式的動詞開頭，不帶主語。
2. 通常為 Add、Consolidate、Fix、Improve、Remove、Rename、Replace、Simplify、Standardize、Update、Upgrade。
   - Add … to …
   - Add … in …
   - Consolidate … into …
   - Fix … in …
   - Remove … from …
   - Rename … to …
   - Replace … with …
   - Simplify … by …
   - Standardize … to …
   - Update … in …
   - Upgrade … to …

### 約定俗成的 Body

1. 以阿拉伯數字條列呈現。每列首字大寫，並以「.」結尾。
2. 開頭除了像 Subject 那樣外，還可能有 Disable、Drop、Enable、Include、Move、Reset。
   - Move … to …
   - Reset … to …
3. 以重要度優先排序，如無法區分，則依照首字英文字母順序由上至下排列。

Type 和 Scope 可以幫助團隊成員快速了解本次 Commit 的性質和影響範圍，因此每個 Commit 的主題應當盡可能聚焦，不相關的東西應該要分開提交。

## 範例

```shell
Feat(API): Add "is_enabled" field to stores api
```

```shell
Fix(Config): Update source paths for MUI
```

```shell
Revert: Fix(Config): Update source paths for MUI
```

```shell
Feat(Theme): Update padding of section A
```

```shell
Feat(Views): Add copyright block to homepage
```

```shell
Style(Config): Update coding style
```

```shell
Fix(Views): Add missing files

1. File A.
```

```shell
Fix(Module): Fix checkout module

1. Fix getCoupon function.
2. Update getAddress function.

Reference:
1. TA-123.
```

```shell
Chore(Project): Include scripts directory in format and lint scripts
```

```shell
Feat(Framework)!: Upgrade React to 19.2.0

1. Line one.
2. Line two.


BREAKING CHANGE:
1. Something.

Reference:
1. example.com/tutorial.
```

```shell
Feat(Vendor): Add fontawesome pro 6.1.1

1. Line one.
2. Line two.

Note:
1. Please run "npm install" to apply this commit.
```

## 重點提示

1. 良好的 Git Commit Message 有利於專案的維護和後續自動化的處理。
2. 規範主要促進協作風格的統一。
3. 每個團隊都有不同的規範，可依實際需求變更。
4. 提交的內容應當聚焦，彼此無關的變更應該分開 Commit。
5. 填入 Issue Key 有利於問題追蹤。
6. 可使用自動化工具幫助正確編寫 Git Commit Message。

## 參考資料

1. How to Write a Git Commit Message
   - https://cbea.ms/git-commit/
2. How to Write Better Git Commit Messages – A Step-By-Step Guide
   - https://www.freecodecamp.org/news/how-to-write-better-git-commit-messages/
3. commitlint
   - https://github.com/conventional-changelog/commitlint
4. Conventional Commits
   - https://www.conventionalcommits.org/en
5. Commit Message Guide
   - https://developers.google.com/blockly/guides/contribute/get-started/commits
