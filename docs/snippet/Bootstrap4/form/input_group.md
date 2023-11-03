---
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Input Group)](https://getbootstrap.com/docs/4.6/components/input-group/)
=====================

bsin-group-l
--------------------

```html
<div class="input-group">
  <div class="input-group-prepend">
    <span class="input-group-text" id="${3:text}-prepend">${1:&yen;}</span>
  </div>
  <input type="${2:text}" name="${3:text}" id="${3:text}" value="" class="form-control">
</div>
<!-- /.input-group -->
```

bsin-group-r
--------------------

```html
<div class="input-group">
  <input type="${1:text}" name="${2:text}" id="${2:text}" value="" class="form-control">
  <div class="input-group-append">
    <span class="input-group-text" id="${2:text}-append">${3:円}</span>
  </div>
</div>
<!-- /.input-group -->
```

bsin-group-lr
--------------------

```html
<div class="input-group">
  <div class="input-group-prepend">
    <span class="input-group-text" id="${3:text}-prepend">${1:&yen;}</span>
  </div>
  <input type="${2:text}" name="${3:text}" id="${3:text}" value="" class="form-control">
  <div class="input-group-append">
    <span class="input-group-text" id="${3:text}-append">${4:円}</span>
  </div>
</div>
<!-- /.input-group -->
```
