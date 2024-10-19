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
  <a class="btn btn-primary" data-toggle="collapse" href="#${1}" role="button" aria-expanded="false" aria-controls="${1:target}">
    ${2:Link with href}
  </a>
  <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#${1}" aria-expanded="false" aria-controls="${1:target}">
    ${3:Button with data-target}
  </button>
</p>
<div class="collapse" id="${1:target}">
  <div class="card card-body">
    ${4:Some placeholder content for the collapse component}
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

collapse-collapse
---------------------

```html
<div class="collapse" id="${1:target}">
  <div class="card card-body">
    ${2:Some placeholder content for the collapse component}
  </div>
</div>
<!-- /.collapse -->
```
