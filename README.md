Kemuri
==================

Mock builder

インストール方法
------------------

```bash
# npm
npm install wate/kemuri -D
# yarn
yarn add wate/kemuri -D
# pnpm
pnpm add -D wate/kemuri
```

利用方法
------------------

### 全ファイルのビルド

```bash
# npm
npx builder
# yarn
yarn dlx builder
# pnpm
pnpm dlx builder
```

#### サーバーも同時に起動する

```bash
# npm
npx builder --server
# yarn
yarn dlx builder --server
# pnpm
pnpm dlx builder --server
```

### ファイルの監視と変更されたファイルのビルド

```bash
# npm
npx builder --watch
# yarn
yarn dlx builder --watch
# pnpm
pnpm dlx builder --watch
```

#### サーバーも同時に起動する

```bash
# npm
npx builder --watch --server
# yarn
yarn dlx builder --watch --server
# pnpm
pnpm dlx builder --watch --server
```

### スクリーンショットの取得

```bash
# npm
npx screenshot
# yarn
yarn dlx screenshot
# pnpm
pnpm dlx screenshot
```

ディレクトリ構造
------------------

デフォルトのディレクトリ構造は以下の通りです。

```
{PROJECT_ROOT}/
├ .vscode/ <= VSCode用プロジェクトスニペット出力先ディレクトリ
├ .builderrc.yml <= 設定ファイル
├ docs/
│   └ snippet/ <= スニペットデータ格納ディレクトリ
├ public/  <= HTML出力先ディレクトリ
│   └ assets/
│        ├ css/ <= CSS出力先ディレクトリ
│        └ js/ <= JS出力先ディレクトリ
├ screenshots/ <= スクリーンショット出力先ディレクトリ
└ src/ <= ソースファイル(HTML/CSS/JS共)格納ディレクトリ
```

設定ファイルの書き方
------------------

以下のコマンドを実行すると設定ファイルが生成されます。

デフォルト値の内容がコメントアウトされた状態で記載されていますので、
必要に応じてコメントアウトを解除して設定を行ってください。

```bash
# npm
npx builder --init
# yarn
yarn dlx builder --init
# pnpm
pnpm dlx builder --init
```
