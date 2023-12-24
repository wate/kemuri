スニペット名重複時のテストケース
==============================

duplication-name-test
---------------------

重複したスニペット名のテストケースです。

```js
const openModalBtn = document.getElementById("openModalBtn");
const modal = document.getElementById("myModal");
const closeBtn = document.getElementsByClassName("close")[0];

openModalBtn.addEventListener("click", function() {
  modal.style.display = "block";
});

closeBtn.addEventListener("click", function() {
  modal.style.display = "none";
});

window.addEventListener("click", function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});   
```

### Snippet setting

```yaml
description: duplication-name-test-js
orverwrite: true
prefix: 
 - duplication-name-test
 - duplication-name-test-js
```

### 想定値

* `duplication-name-test[javascript]`というスニペットが出力される
    * `body`にソースコードブロックの内容を設定されている
    * `prefix`に`duplication-name-test`と`duplication-name-test-js`が設定されている
    * `scope`に`javascript`が設定されている
    * `description`に`duplication-name-test-js`が出力されている
