---
prefix: bs-
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Breadcrumb)](https://getbootstrap.com/docs/4.6/components/breadcrumb/)
=====================

breadcrumb
----------------------

```html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item active">Library</li>
  </ol>
</nav>
<!-- /.breadcrumb -->
```

breadcrumb-item
----------------------

```html
<li class="breadcrumb-item"><a href="${1:#}">${2:Item}</a></li>
```

breadcrumb-item-active
----------------------

```html
<li class="breadcrumb-item active">${1:Item}</li>
```
