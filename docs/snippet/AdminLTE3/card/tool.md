---
scope: twig
---

[AdminLte(Card Widget)](https://adminlte.io/docs/3.2/javascript/card-widget.html)
=======================

ltecard-tool-plus
---------------------

```html
<!-- Collapse Button (card Widgets add "collapsed-card" class) -->
<button type="button" class="btn btn-tool" data-card-widget="collapse">
  <i class="fas fa-plus"></i>
</button>
```

ltecard-tool-minus
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
  - ltecard-tool-collapse

```

ltecard:tool-times
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
  - ltecard-tool-remove
```

ltecard-tool-expand
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
  - ltecard-tool-maximize
```

ltecard-tool-refresh
---------------------

[Card Refresh Plugin](https://adminlte.io/docs/3.2/javascript/card-refresh.html)

```html
<!-- Refresh Button -->
<button type="button" class="btn btn-tool" data-card-widget="card-refresh" data-source="${1:/widget.html}">
  <i class="fas fa-sync-alt"></i>
</button>
```
