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

初期設定
------------------

以下のコマンドを実行すると設定ファイルの雛形や各種ディレクトリが生成されます。

デフォルト値の内容がコメントアウトされた状態で記載していますので、  
必要に応じてコメントアウトを解除して設定を行ってください。

```bash
# npm
npx kemuri --init
# yarn
yarn exec kemuri --init
# pnpm
pnpm exec kemuri --init
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

利用方法
------------------

### ファイルのビルド

```bash
# npm
npx kemuri
# yarn
yarn exec kemuri
# pnpm
pnpm exec kemuri
```

#### サーバーも同時に起動する

```bash
# npm
npx kemuri --server
# yarn
yarn exec kemuri --server
# pnpm
pnpm exec kemuri --server
```

### ファイルの監視と変更されたファイルのビルド

```bash
# npm
npx kemuri --watch
# yarn
yarn exec kemuri --watch
# pnpm
pnpm exec kemuri --watch
```

#### サーバーも同時に起動する

```bash
# npm
npx kemuri --watch --server
# yarn
yarn exec kemuri --watch --server
# pnpm
pnpm exec kemuri --watch --server
```

### スクリーンショットの取得

スクリーンショットの取得には、Playwrightを利用します、
Playwrightの各バージョンが動作するには、特定のバージョンのブラウザバイナリが必要です。
ブラウザバイナリをインストールするには、インストールコマンドを使用する必要があります。
※ブラウザのインストール方法は「ブラウザバイナリのインストール」を参照してください。

```bash
# npm
npx kemuri-screenshot
# yarn
yarn exec kemuri-screenshot
# pnpm
pnpm exec kemuri-screenshot
```

#### ブラウザバイナリのインストール

Playwrightはリリースのたびにサポートするブラウザのバージョンを更新し、
最新のPlaywrightがいつでも最新のブラウザをサポートできるようにします。
つまり、Playwrightを更新するたびに、以下のインストールコマンドを再実行する必要がある可能性があります。

```bash
# npm
npx playwright install
# yarn
yarn exec playwright install
# pnpm
pnpm exec playwright install
```

### スニペットファイルのビルド

```bash
# npm
npx kemuri-snippet
# yarn
yarn exec kemuri-snippet
# pnpm
pnpm exec kemuri-snippet
```

Tips
------------------

### 環境変数を使った設定

設定ファイルを作成せずに環境変数を利用して設定を行うことも可能です。  
※環境変数の設定方法は各OSによって異なります。

環境変数名の詳細は[.env.example](.env.example)を参照してください。

```bash
# npm
KEMURI_SERVER_PORT=8080 npx kemuri --server
# yarn
KEMURI_SERVER_PORT=8080 yarn exec kemuri --server
# pnpm
KEMURI_SERVER_PORT=8080 pnpm exec kemuri --server
```

### パッケージマネージャー(npm/yarn/pnpm)ごとの実行方法の違い

パッケージマネージャーによりコマンドの実行方法が異なります。
  
パッケージマネージャーのコマンド実行方法を統一したいといった場合は、  
`ni`の導入の検討することをおすすめします。

* [antfu/ni: 💡 Use the right package manager](https://github.com/antfu/ni)
    * [npm、yarn、pnpm それぞれのコマンドを覚えるのに疲れた方へ](https://qiita.com/oekazuma/items/12abf4c1bc1dbc63be85)
