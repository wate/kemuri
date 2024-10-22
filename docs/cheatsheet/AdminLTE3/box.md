---
prefix: lte-
scope: 
  - twig
  - nunjucks
---
[AdminLte(Box)](https://adminlte.io/docs/3.2/components/boxes.html)
=======================

box
---------------------

```html
<div class="info-box">
  <span class="info-box-icon ${1|bg-primary,bg-secondary,bg-success,bg-info,bg-warning,bg-danger,bg-light,bg-dark|}"><i class="fas fa-question-circle"></i></span>
  <div class="info-box-content">
    <span class="info-box-text">${2:Name}</span>
    <span class="info-box-number">${3:123}</span>
  </div>
</div>
```

### VSCode Extra Setting

```yaml
prefix:
  - box-info
```

box-small
---------------------

```html
<div class="small-box ${1|bg-primary,bg-secondary,bg-success,bg-info,bg-warning,bg-danger,bg-light,bg-dark|}">
  <div class="inner">
    <h3>${2:123}</h3>
    <p>${3:Name}</p>
  </div>
  <div class="icon">
    <i class="fas fa-shopping-cart"></i>
  </div>
  <a href="${4:#}" class="small-box-footer">More info <i class="fas fa-arrow-circle-right"></i>
  </a>
</div>
```
