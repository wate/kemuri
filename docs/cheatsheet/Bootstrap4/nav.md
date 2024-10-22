---
prefix: bs-
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Nav)](https://getbootstrap.com/docs/4.6/components/navs/)
=====================

nav
---------------------

```html
<ul class="nav">
  <li class="nav-item">
    <a class="nav-link active" href="#">Active</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#">Link</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#">Link</a>
  </li>
</ul>
<!-- /.nav -->
```

nav-item
---------------------

```html
<li class="nav-item">
  <a class="nav-link" href="${1:#}">${2:Item}</a>
</li>
```
