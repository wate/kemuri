---
prefix: bs-
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Dropdown)](https://getbootstrap.com/docs/4.6/components/dropdowns/)
=====================

dropdown
---------------------

```html
<div class="dropdown">
  <button class="btn btn-${1|primary,secondary,success,info,warning,danger,light,dark|} dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="false">
    ${2:Dropdown button}
  </button>
  <div class="dropdown-menu">
    <a class="dropdown-item" href="#">Action</a>
    <a class="dropdown-item" href="#">Another action</a>
    <a class="dropdown-item" href="#">Something else here</a>
    <div class="dropdown-divider"></div>
    <a class="dropdown-item" href="#">Separated link</a>
  </div>
</div>
```

dropdown-item
---------------------

```html
<a class="dropdown-item" href="${1:#}">${2:Action}</a>
```

dropdown-divider
---------------------

```html
<div class="dropdown-divider"></div>
```
