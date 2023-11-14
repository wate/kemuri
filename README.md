Kemuri
==================

Mockup builder

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

### ファイルのビルド

```bash
# npm
npx kemuri
# yarn
yarn dlx kemuri
# pnpm
pnpm dlx kemuri
```

#### サーバーも同時に起動する

```bash
# npm
npx kemuri --server
# yarn
yarn dlx kemuri --server
# pnpm
pnpm dlx kemuri --server
```

### ファイルの監視と変更されたファイルのビルド

```bash
# npm
npx kemuri --watch
# yarn
yarn dlx kemuri --watch
# pnpm
pnpm dlx kemuri --watch
```

#### サーバーも同時に起動する

```bash
# npm
npx kemuri --watch --server
# yarn
yarn dlx kemuri --watch --server
# pnpm
pnpm dlx kemuri --watch --server
```

### スクリーンショットの取得

```bash
# npm
npx kemuri-screenshot
# yarn
yarn dlx kemuri-screenshot
# pnpm
pnpm dlx kemuri-screenshot
```

### スニペットファイルのビルド

```bash
# npm
npx kemuri-snippet
# yarn
yarn dlx kemuri-snippet
# pnpm
pnpm dlx kemuri-snippet
```

ディレクトリ構造
------------------

デフォルトのディレクトリ構造は以下の通りです。

```
{PROJECT_ROOT}/
├ .vscode/ <= VSCode用プロジェクトスニペット出力先ディレクトリ
├ .kemurirc.yml <= 設定ファイル
├ docs/
│   └ cheatsheet/ <= スニペットデータ格納ディレクトリ
├ public/  <= HTML出力先ディレクトリ
│   └ assets/
│        ├ css/ <= CSS出力先ディレクトリ
│        └ js/ <= JS出力先ディレクトリ
├ screenshots/ <= スクリーンショット出力先ディレクトリ
└ src/ <= ソースファイル(HTML/CSS/JS共)格納ディレクトリ
```

設定ファイル
------------------

以下のコマンドを実行すると設定ファイルの雛形が生成されます。

デフォルト値の内容がコメントアウトされた状態で記載していますので、  
必要に応じてコメントアウトを解除して設定を行ってください。

```bash
# npm
npx kemuri --init
# yarn
yarn dlx kemuri --init
# pnpm
pnpm dlx kemuri --init
```

Tips
------------------

* [antfu/ni: 💡 Use the right package manager](https://github.com/antfu/ni)
    * [npm、yarn、pnpm それぞれのコマンドを覚えるのに疲れた方へ #npm - Qiita](https://qiita.com/oekazuma/items/12abf4c1bc1dbc63be85)
