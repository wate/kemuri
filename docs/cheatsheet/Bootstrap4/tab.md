---
prefix: bs-
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Tab)](https://getbootstrap.com/docs/4.6/components/navs/#javascript-behavior)
=====================

tab
---------------------

```html
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="${1:home}-tab" data-toggle="tab" data-target="#${1:home}" type="button" role="tab" aria-controls="${1:home}" aria-selected="true">${1:home}</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="${2:profile}-tab" data-toggle="tab" data-target="#${2:profile}" type="button" role="tab" aria-controls="${2:profile}" aria-selected="false">{2:profile}</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="${3:contact}-tab" data-toggle="tab" data-target="#${3:contact}" type="button" role="tab" aria-controls="${3:contact}" aria-selected="false">${3:contact}</button>
  </li>
</ul>
<!-- /.nav-tabs -->
<div class="tab-content">
  <div class="tab-pane fade show active" id="${1:home}" role="tabpanel" aria-labelledby="${1:home}-tab">
    ${1:home} tab content
  </div>
  <!-- /.tab-pane -->
  <div class="tab-pane fade" id="${2:profile}" role="tabpanel" aria-labelledby="${2:profile}-tab">
    {2:profile} tab content
  </div>
  <!-- /.tab-pane -->
  <div class="tab-pane fade" id="${3:contact}" role="tabpanel" aria-labelledby="${3:contact}-tab">
    ${3:contact} tab content
  </div>
  <!-- /.tab-pane -->
</div>
<!-- /.tab-content -->
```

tab-tab
---------------------

```html
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="${1:home}-tab" data-toggle="tab" data-target="#${1:home}" type="button" role="tab" aria-controls="${1:home}" aria-selected="true">${1:home}</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="${2:profile}-tab" data-toggle="tab" data-target="#${2:profile}" type="button" role="tab" aria-controls="${2:profile}" aria-selected="false">${2:profile}</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" id="${3:contact}-tab" data-toggle="tab" data-target="#${3:contact}" type="button" role="tab" aria-controls="${3:contact}" aria-selected="false">${3:contact}</button>
  </li>
</ul>
```

tab-tab-item
---------------------

```html
<li class="nav-item" role="presentation">
  <button class="nav-link" id="${1:nav-item}-tab" data-toggle="tab" data-target="#${1:nav-item}" type="button" role="tab" aria-controls="${1:nav-item}" aria-selected="false">Tab</button>
</li>
```

tab-content
---------------------

```html
<div class="tab-content">
  <div class="tab-pane fade show active" id="${1:home}" role="tabpanel" aria-labelledby="${1:home}-tab">
    ${1:home} tab content
  </div>
  <!-- /.tab-pane -->
  <div class="tab-pane fade" id="${2:profile}" role="tabpanel" aria-labelledby="${2:profile}-tab">
    ${2:profile} tab content
  </div>
  <!-- /.tab-pane -->
  <div class="tab-pane fade" id="${3:contact}" role="tabpanel" aria-labelledby="${3:contact}-tab">
    ${3:contact} tab content
  </div>
  <!-- /.tab-pane -->
</div>
<!-- /.tab-content -->
```

tab-content-item
---------------------

```html
<div class="tab-pane fade" id="${1:panel-name}" role="tabpanel" aria-labelledby="${1:panel-name}-tab">
  {tab content}
</div>
```
