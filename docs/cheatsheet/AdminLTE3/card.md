---
prefix: lte-
scope: 
  - twig
  - nunjucks
---
[AdminLte(Card)](https://adminlte.io/docs/3.2/components/cards.html)
=======================

card
---------------------

```html
<div class="card card-${1|default,primary,card-secondary,card-success,card-info,card-warning,card-danger,card-dark|}">
  <div class="card-header">
    <h3 class="card-title">${2:title}</h3>
  </div>
  <div class="card-body">
    ${3:body}
  </div>
</div>
<!-- /.card -->
```

card-outline
---------------------

```html
<div class="card card-outline ${1|default,card-primary,card-secondary,card-success,card-info,card-warning,card-danger,card-dark}">
  <div class="card-header">
    <h3 class="card-title">${2:title}</h3>
  </div>
  <div class="card-body">
    ${3:body}
  </div>
</div>
<!-- /.card -->
```

card-header
---------------------

```html
<div class="card-header">
  <h3 class="card-title">${1:title}</h3>
</div>
```

card-footer
---------------------

```html
<div class="card-footer">
  ${1}
</div>
```

card-tools
---------------------

```html
<div class="card-tools">
  ${1}
</div>
```

card-tool-plus
---------------------

```html
<!-- Collapse Button (card Widgets add "collapsed-card" class) -->
<button type="button" class="btn btn-tool" data-card-widget="collapse">
  <i class="fas fa-plus"></i>
</button>
```

card-tool-minus
---------------------

```html
<!-- Collapse Button -->
<button type="button" class="btn btn-tool" data-card-widget="collapse">
  <i class="fas fa-minus"></i>
</button>
```

### VSCode Extra Setting

```yaml
prefix:
  - card-tool-collapse

```

card-tool-times
---------------------

```html
<!-- Remove Button -->
<button type="button" class="btn btn-tool" data-card-widget="remove">
  <i class="fas fa-times"></i>
</button>
```

### VSCode Extra Setting

```yaml
prefix:
  - card-tool-remove
```

card-tool-expand
---------------------

```html
<!-- Maximize Button -->
<button type="button" class="btn btn-tool" data-card-widget="maximize">
  <i class="fas fa-expand"></i>
</button>
```

### VSCode Extra Setting

```yaml
prefix:
  - card-tool-maximize
```

card-tool-refresh
---------------------

[Card Refresh Plugin](https://adminlte.io/docs/3.2/javascript/card-refresh.html)

```html
<!-- Refresh Button -->
<button type="button" class="btn btn-tool" data-card-widget="card-refresh" data-source="${1:/widget.html}">
  <i class="fas fa-sync-alt"></i>
</button>
```
