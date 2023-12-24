スニペット名重複時のテストケース
==============================

duplication-name-test
---------------------

重複したスニペット名のテストケースです。

```html
<button id="openModalBtn">Open Modal</button>
<div id="myModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Modal Title</h2>
    <p>This is the content of the modal.</p>
  </div>
</div>
```

### Snippet setting

```yaml
description: duplication-name-test-html
orverwrite: true
prefix: 
 - duplication-name-test
 - duplication-name-test-html
```

### 想定値

* `duplication-name-test[html]`というスニペットが出力される
    * `body`にソースコードブロックの内容を設定されている
    * `prefix`に`duplication-name-test`と`duplication-name-test-html`が設定されている
    * `scope`に`html`が設定されている
    * `description`に`duplication-name-test-html`が出力されている
