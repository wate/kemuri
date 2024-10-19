---
prefix: bs-
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Alert)](https://getbootstrap.com/docs/4.6/components/alerts/)
=====================

alert
---------------------

```html
<div class="alert alert-${1|primary,secondary,success,info,warning,danger,light,dark|} alert-dismissible fade show" role="alert">
  <div class="alert-msg">${2:message}</div>
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<!-- /.alert -->
```
