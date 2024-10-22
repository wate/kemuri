---
prefix: bs-
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Collapse)](https://getbootstrap.com/docs/4.6/components/collapse/)
=====================

collapse
---------------------

```html
<p>
  <a class="btn btn-${2|primary,secondary,success,info,warning,danger,light,dark,link|}" data-toggle="collapse" href="#${1:target}" role="button" aria-expanded="false" aria-controls="${1}">
    ${2:Collapse trigger}
  </a>
  <button class="btn btn-${2|primary,secondary,success,info,warning,danger,light,dark,link|}" type="button" data-toggle="collapse" data-target="#${1}" aria-expanded="false" aria-controls="${1}">
    ${2:Collapse trigger}
  </button>
</p>
<div class="collapse" id="${1}">
  <div class="card card-body">
    ${3:Collapse content}
  </div>
</div>
<!-- /.collapse -->
```

collapse-trigger-link
---------------------

```html
<a class="btn btn-primary" data-toggle="collapse" href="#${1}" role="button" aria-expanded="false" aria-controls="${1:target}">
  ${2:Link with href}
</a>
```

collapse-trigger-btn
---------------------

```html
<button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#${1}" aria-expanded="false" aria-controls="${1:target}">
  ${2:Button with data-target}
</button>
```

collapse-content
---------------------

```html
<div class="collapse" id="${1:target}">
  <div class="card card-body">
    ${2:Collapse content}
  </div>
</div>
<!-- /.collapse -->
```
