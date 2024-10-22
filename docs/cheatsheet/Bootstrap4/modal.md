---
prefix: bs-
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Modal)](https://getbootstrap.com/docs/4.6/components/modal/)
=====================

modal
---------------------

```html
<!-- Button trigger modal -->
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#${1}">
  ${2:Launch modal}
</button>
<!-- Modal -->
<div class="modal fade" id="${1}" tabindex="-1" aria-labelledby="${1}Label" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="${1}Label">${3:Modal title}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="${5:Close}">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        ${4:Modal Body}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">${5:Close}</button>
        <button type="button" class="btn btn-primary">${6:Save changes}</button>
      </div>
    </div>
  </div>
</div>
<!-- /.modal -->
```

modal-trigger
---------------------

```html
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#${1:modal-target}">
   ${2:Launch modal}
</button>
```

modal-modal
---------------------

```html
<div class="modal fade" id="${1}" tabindex="-1" aria-labelledby="${1}Label" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="${1}Label">${2:Modal title}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="${4:Close}">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        ${3:Modal Body}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">${4:Close}</button>
        <button type="button" class="btn btn-primary">${5:Save changes}</button>
      </div>
    </div>
  </div>
</div>
<!-- /.modal -->
```
