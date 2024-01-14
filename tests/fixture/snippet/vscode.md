VSCodeスニペット設定テストケース
=====================

test-extra-setting-description
---------------------

スニペットの説明

```html
<html>
  <head>
    <title>test</title>
  </head>
  <body>
    <h1>test</h1>
  </body>
</html>
```

### VSCode Extra Setting

```yaml
## スニペットの説明を上書きする
description: 上書きするスニペットの説明
```

### 想定値

* `test-extra-setting-description[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-no-inherit-description`が設定されている
    * `scope`に`html`が設定されている
    * `description`に`上書きするスニペットの説明`が出力されている

test-extra-setting-scope
---------------------

スニペットの説明

```html
<html>
  <head>
    <title>test</title>
  </head>
  <body>
    <h1>test</h1>
  </body>
</html>
```

### VSCode Extra Setting

```yaml
## スニペットのscopeを追加する
prefix: 
  - twig
  - nunjucks
```

### 想定値

* `test-extra-setting-scope[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-extra-setting-scope`が設定されている
    * `scope`に`html,twig,nunjucks`が設定されている
    * `description`に`スニペットの説明`が出力されている

test-extra-setting-prefix-string
---------------------

スニペットの説明

```html
<html>
  <head>
    <title>test</title>
  </head>
  <body>
    <h1>test</h1>
  </body>
</html>
```

### VSCode Extra Setting

```yaml
## スニペットのprefixを追加する
prefix: test-extra-setting-prefix-alternative
```

### 想定値

* `test-extra-setting-prefix-string[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に以下の2つが設定されている
        * `test-extra-setting-prefix-string`
        * `test-extra-setting-prefix-alternative`
    * `scope`に`html`が設定されている
    * `description`に`スニペットの説明`が出力されている

test-extra-setting-prefix-array
---------------------

スニペットの説明

```html
<html>
  <head>
    <title>test</title>
  </head>
  <body>
    <h1>test</h1>
  </body>
</html>
```

### VSCode Extra Setting

```yaml
## スニペットのprefixを追加する
prefix: 
  - test-extra-setting-prefix-alternative-01
  - test-extra-setting-prefix-alternative-02
```

### 想定値

* `test-extra-setting-prefix-array[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に以下の3つが設定されている
        * `test-extra-setting-prefix-array`
        * `test-extra-setting-prefix-alternative-01`
        * `test-extra-setting-prefix-alternative-02`
    * `scope`に`html`が設定されている
    * `description`に`スニペットの説明`が出力されている

プレフィックスの上書き(文字列)
---------------------

スニペットの説明

```html
<html>
  <head>
    <title>test</title>
  </head>
  <body>
    <h1>test</h1>
  </body>
</html>
```

### VSCode Extra Setting

```yaml
## スニペットのprefixを上書きする
orverwrite: true
prefix: test-extra-setting-prefix-orverwrite
```

### 想定値

* `プレフィックスの上書き(文字列)[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-extra-setting-prefix-orverwrite`が設定されており、`プレフィックスの上書き(文字列)`は設定されていない
    * `scope`に`html`が設定されている
    * `description`に`スニペットの説明`が出力されている

プレフィックスの上書き(配列)
---------------------

スニペットの説明

```html
<html>
  <head>
    <title>test</title>
  </head>
  <body>
    <h1>test</h1>
  </body>
</html>
```

### VSCode Extra Setting

```yaml
## スニペットのprefixを上書きする
orverwrite: true
prefix: 
  - test-extra-setting-prefix-orverwrite-01
  - test-extra-setting-prefix-orverwrite-02
```

### 想定値

* `プレフィックスの上書き(配列)[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に以下の2つが設定されており、`プレフィックスの上書き(配列)`は設定されていない
        * `test-extra-setting-prefix-orverwrite-01`
        * `test-extra-setting-prefix-orverwrite-02`
    * `scope`に`html`が設定されている
    * `description`に`スニペットの説明`が出力されている

test-extra-setting-language-override
---------------------

言語ごとにスニペットの設定を上書きする

※各言語ごとの`prefix`の設定の上書きはサポートしない
(そういったユースケースはスニペット自体を分離することで対応可能なため)

### HTMLのソースコード

```html
<html>
  <head>
    <title>test</title>
  </head>
  <body>
    <h1>test</h1>
  </body>
</html>
```

### CSSのソースコード

```css
body {
  background-color: #000;
}
```

### JavaScriptのソースコード

JavsScriptの説明文

```js
alert('test');
```

### VSCode Extra Setting

```yaml
description: 上書きするスニペットの説明
javascript:
  description: 上書きするJavsScript用スニペットの説明
  scope: 
    - typescript
css:
  description: 上書きするCSS用スニペットの説明
  scope: 
    - scss
    - sass
```

### 想定値

* `test-extra-setting-language-override[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-extra-setting-language-override`が設定されている
    * `scope`に`html`が設定されている
    * `description`に`上書きするスニペットの説明`が出力されている
* `test-extra-setting-language-override[javascript]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-extra-setting-language-override`が設定されている
    * `scope`に`javascript,typescript`が設定されている
    * `description`に`上書きするJavsScript用スニペットの説明`が出力されている
* `test-extra-setting-language-override[css]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-extra-setting-language-override`が設定されている
    * `scope`に`css,scss,sass`が設定されている
    * `description`に`上書きするCSS用スニペットの説明`が出力されている
