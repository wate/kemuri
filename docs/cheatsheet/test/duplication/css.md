スニペット名重複時のテストケース
==============================

duplication-name-test
---------------------

重複したスニペット名のテストケースです。

```css
.modal {
  display: none;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
```

### Snippet setting

```yaml
description: duplication-name-test-css
orverwrite: true
prefix: 
 - duplication-name-test
 - duplication-name-test-css
```

### 想定値

* `duplication-name-test[css]`というスニペットが出力される
    * `body`にソースコードブロックの内容を設定されている
    * `prefix`に`duplication-name-test`と`duplication-name-test-css`が設定されている
    * `scope`に`css`が設定されている
    * `description`に`duplication-name-test-css`が出力されている
