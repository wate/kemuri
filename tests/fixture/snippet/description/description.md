テストケース
=====================

test-non-description
---------------------

<!-- この部分のdescriptionは出力されない -->

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

test-description-multi-paragraph
---------------------

この説明がdescriptionに設定されます。

2つ目以降の段落はdescriptionは出力されません。

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

* `test-description-multi-paragraph[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-description-multi-paragraph`が設定されている
    * `scope`に`html`が設定されている
    * `description`には`この説明がdescriptionに設定されます。`が出力される

test-description-has-inline_code
---------------------

説明にインラインコードを含む場合はインラインコードの内容を含めて`description`に出力されます。

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

* `test-description-has-inline_code[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-description-has-inline_code`が設定されている
    * `scope`に`html`が設定されている
    * `description`には`説明にインラインコードを含む場合はインラインコードの内容を含めてdescriptionに出力されます。`と出力される

test-description-has-link
---------------------

説明にリンクを含む場合は[リンクの説明](http://www.example.com)部分がdescriptionに出力されます。

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

* `test-description-has-link[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-description-has-link`が設定されている
    * `scope`に`html`が設定されている
    * `description`には`説明にリンクを含む場合はリンクの説明部分がdescriptionに出力されます。`と出力される

test-description-has-link_and_inline_code
---------------------

説明にリンクを含む場合は[リンクの説明](http://www.example.com)部分が`description`に出力されます。

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

* `test-description-has-link_and_inline_code[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-description-has-link_and_inline_code`が設定されている
    * `scope`に`html`が設定されている
    * `description`には`説明にリンクを含む場合はリンクの説明部分がdescriptionに出力されます。`と出力される

