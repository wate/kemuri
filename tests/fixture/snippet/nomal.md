テストケース
=====================

test-single-source
---------------------

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

### 想定値

* `test-single-source[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-single-source`が設定されている
    * `scope`に`html`が設定されている
    * `description`が出力されていない

test-multi-source
---------------------

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

```css
body {
  background-color: #000;
}
```

```js
alert('test');
```

### 想定値

* `test-multi-source[html]`というスニペットが出力される
    * `body`に**HTMLソースコードブロック**の内容を設定されている
    * `prefix`に`test-multi-source`が設定されている
    * `scope`に`html`が設定されている
    * `description`が出力されていない
* `test-multi-source[css]`というスニペットが出力される
    * `body`に**CSSソースコードブロック**の内容を設定されている
    * `prefix`に`test-multi-source`が設定されている
    * `scope`に`css`が設定されている
    * `description`が出力されていない
* `test-multi-source[javascript]`というスニペットが出力される
    * `body`に**JSソースコードブロック**の内容を設定されている
    * `prefix`に`test-multi-source`が設定されている
    * `scope`に`javascript`が設定されている
    * `description`が出力されていない

test-no-source
---------------------

### 想定値

* `test-no-source`というスニペットが出力されていない

test-no-source-with-description
---------------------

この部分はスニペットとして出力されません。

### 想定値

* `test-no-source-with-description`というスニペットが出力されていない

test-single-source-with-description
---------------------

テストケース3

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

### 想定値

* `test-single-source-with-description[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容を設定されている
    * `prefix`に`test-single-source-with-description`が設定されている
    * `scope`に`html`が設定されている
    * `description`に`テストケース3`が設定されている

test-single-source-with-description-and-note
---------------------

テストケース4

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

※補足説明補足説明補足説明補足説明

### 想定値

* `test-single-source-with-description-and-note[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-single-source-with-description-and-note`が設定されている
    * `scope`に`html`が設定されている
    * `description`に`テストケース4`が設定されている

test-multi-source-with-description-no-lang_header
---------------------

テストケース5

HTMLの説明文

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

CSSの説明文

```css
body {
  background-color: #000;
}
```

JSの説明文

```js
alert('test');
```

### 想定値

* `test-multi-source-with-description-no-lang_header[html]`というスニペットが出力される
    * `body`に**HTMLソースコードブロック**の内容が設定されている
    * `prefix`に`test-multi-source-with-description-no-lang_header`が設定されている
    * `scope`に`html`が設定されている
    * `description`に`テストケース5`が設定されている
* `test-multi-source-with-description-no-lang_header[css]`というスニペットが出力される
    * `body`に**CSSソースコードブロック**の内容が設定されている
    * `prefix`に`test-multi-source-with-description-no-lang_header`が設定されている
    * `scope`に`css`が設定されている
    * `description`に`テストケース5`が設定されている
* `test-multi-source-with-description-no-lang_header[javascript]`というスニペットが出力される
    * `body`に**JSソースコードブロック**の内容が設定されている
    * `prefix`に`test-multi-source-with-description-no-lang_header`が設定されている
    * `scope`に`javascript`が設定されている
    * `description`に`テストケース5`が設定されている

test-multi-source-with-description-and-lang_header
---------------------

テストケース6

### HTMLのソースコード

HTMLの説明文

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

CSSの説明文

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

### 想定値

* `test-multi-source-with-description-and-lang_header[html]`というスニペットが出力される
    * `body`に**HTMLソースコードブロック**の内容が設定されている
    * `prefix`に`test-multi-source-with-description-and-lang_header`が設定されている
    * `scope`に`html`が設定されている
    * `description`に`テストケース6`が設定されている
* `test-multi-source-with-description-and-lang_header[css]`というスニペットが出力される
    * `body`に**CSSソースコードブロック**の内容が設定されている
    * `prefix`に`test-multi-source-with-description-and-lang_header`が設定されている
    * `scope`に`css`が設定されている
    * `description`に`テストケース6`が設定されている
* `test-multi-source-with-description-and-lang_header[javascript]`というスニペットが出力される
    * `body`に**JSソースコードブロック**の内容が設定されている
    * `prefix`に`test-multi-source-with-description-and-lang_header`が設定されている
    * `scope`に`javascript`が設定されている
    * `description`に`テストケース6`が設定されている

test-multi-source-with-description-and-lang_header-and-note
---------------------

テストケース7

### HTMLのソースコード

HTMLの説明文

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

※HTMLの補足説明

### CSSのソースコード

CSSの説明文

```css
body {
  background-color: #000;
}
```

※CSSの補足説明

### JavaScriptのソースコード

JavsScriptの説明文

```js
alert('test');
```

※JSの補足説明

### 想定値

* `test-multi-source-with-description-and-lang_header-and-note[html]`というスニペットが出力される
    * `body`に**HTMLソースコードブロック**の内容が設定されている
    * `prefix`に`test-multi-source-with-description-and-lang_header-and-note`が設定されている
    * `scope`に`html`が設定されている
    * `description`に`テストケース7`が設定されている
* `test-multi-source-with-description-and-lang_header-and-note[css]`というスニペットが出力される
    * `body`に**CSSソースコードブロック**の内容が設定されている
    * `prefix`に`test-multi-source-with-description-and-lang_header-and-note`が設定されている
    * `scope`に`css`が設定されている
    * `description`に`テストケース7`が設定されている
* `test-multi-source-with-description-and-lang_header-and-note[javascript]`というスニペットが出力される
    * `body`に**JSソースコードブロック**の内容が設定されている
    * `prefix`に`test-multi-source-with-description-and-lang_header-and-note`が設定されている
    * `scope`に`javascript`が設定されている
    * `description`に`テストケース7`が設定されている

test-no-inherit-description
---------------------

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

### 想定値

* `test-no-inherit-description[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-no-inherit-description`が設定されている
    * `scope`に`html`が設定されている
    * `description`が出力されていない
