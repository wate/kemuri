---
suffix: -yaml-meta-suffix-test
---
YAMLメタデータ(prefix)テストケース
=====================

スニペット名の接尾語に`-yaml-meta-suffix-test`を自動付与します。

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

* `sample-01-yaml-meta-suffix-test[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`sample-01-yaml-meta-suffix-test`が設定されている
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

* `sample-02-yaml-meta-suffix-test[css]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`sample-02-yaml-meta-suffix-test`が設定されている
    * `scope`に`css`が設定されている
    * `description`が出力されていない

sample-03
---------------------

```js
alert('test');
```

### 想定値

* `sample-03-yaml-meta-suffix-test[javascript]`というスニペットが出力される
    * `body`にソースコードブロックの内容が設定されている
    * `prefix`に`sample-03-yaml-meta-suffix-test`が設定されている
    * `scope`に`javascript`が設定されている
    * `description`が出力されていない
