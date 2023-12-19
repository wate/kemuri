---
prefix: yaml-meta-prefix-test-
---
YAMLメタデータ(prefix)テストケース
=====================

スニペット名の接頭語に`yaml-meta-prefix-test-`を自動付与します。

sample-01
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

* `yaml-meta-prefix-test-sample-01[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`yaml-meta-prefix-test-sample-01`が設定されている
    * `scope`に`html`が設定されている
    * `description`が出力されていない

sample-02
---------------------

```css
body {
  background-color: #000;
}
```

### 想定値

* `yaml-meta-prefix-test-sample-02[css]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`yaml-meta-prefix-test-sample-02`が設定されている
    * `scope`に`css`が設定されている
    * `description`が出力されていない

sample-03
---------------------

```js
alert('test');
```

### 想定値

* `yaml-meta-prefix-test-sample-03[javascript]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`yaml-meta-prefix-test-sample-03`が設定されている
    * `scope`に`javascript`が設定されている
    * `description`が出力されていない
