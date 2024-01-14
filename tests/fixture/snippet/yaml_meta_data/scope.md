---
scope: 
  - twig
  - nunjucks
---
YAMLメタデータ(scope)テストケース
=====================

すべてのスニペットのスコープに`twig`と`nunjucks`を付与しています。

test-scope-sample-01
---------------------

```html
<html>
  <head>
    <title>test-scope-sample-01</title>
  </head>
  <body>
    <h1>test-scope-sample-01</h1>
  </body>
</html>
```

### 想定値

* `test-scope-sample-01[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-scope-sample-01`が設定されている
    * `scope`に`html,twig,nunjucks`が設定されている
    * `description`が出力されていない

test-scope-sample-02
---------------------

```html
<html>
  <head>
    <title>test-scope-sample-02</title>
  </head>
  <body>
    <h1>test-scope-sample-02</h1>
  </body>
</html>
```

### 想定値

* `test-scope-sample-02[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-scope-sample-02`が設定されている
    * `scope`に`html,twig,nunjucks`が設定されている
    * `description`が出力されていない

test-scope-sample-03
---------------------

```html
<html>
  <head>
    <title>test-scope-sample-03</title>
  </head>
  <body>
    <h1>test-scope-sample-03</h1>
  </body>
</html>
```

### 想定値

* `test-scope-sample-03[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`test-scope-sample-03`が設定されている
    * `scope`に`html,twig,nunjucks`が設定されている
    * `description`が出力されていない
