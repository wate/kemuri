---
scope: 
  - twig
  - nunjucks
---
[AdminLte(Sidebar)](https://adminlte.io/docs/3.2/components/main-sidebar.html)
=======================

lteside-item
-----------------------

```html
<li class="nav-item">
  <a href="${1:#}" class="nav-link">
    <i class="fas fa-question-circle nav-icon"></i>
    <p>${2:Menu}</p>
  </a>
</li>
<!-- /.nav-item -->
```

lteside-item-tree
-----------------------

[Treeview Plugin](https://adminlte.io/docs/3.2/javascript/treeview.html)

```html
<li class="nav-item">
  <a href="#" class="nav-link">
    <i class="fas fa-question-circle nav-icon"></i>
    <p>
      ${1:Tree Menu}
      <i class="right fas fa-angle-left"></i>
    </p>
  </a>
  <ul class="nav nav-treeview">
    <li class="nav-item">
      <a href="${2:#}" class="nav-link">
        <i class="far fa-circle nav-icon"></i>
        <p>${3:Sub Item}</p>
      </a>
    </li>
  </ul>
</li>
<!-- /.nav-item -->
```

lteside-item-header
-----------------------

```html
<li class="nav-header">${1:Menu Header}</li>
```

lteside-search
-----------------------

メニュー項目の検索に利用する場合は以下のURL参照  
[Sidebar Search Plugin](https://adminlte.io/docs/3.2/javascript/sidebar-search.html)

```html
<form class="form-inline" action="${1:#}">
  <div class="input-group">
    <input class="form-control form-control-sidebar" type="search" name="keyword" id="sidevar-search" placeholder="keyword" aria-label="Search">
    <div class="input-group-append">
      <button class="btn btn-sidebar" type="submit">
        <i class="fas fa-search"></i>
      </button>
    </div>
  </div>
</form>
<!-- /search -->
```

lteside-user
-----------------------

```html
<div class="user-panel mt-3 pb-3 mb-3 d-flex">
  <div class="image">
    <img src="https://dummyimage.com/160x160?text=${2:User Name}" class="img-circle" alt="User Image">
  </div>
  <div class="info">
    <a href="${1:#}" class="d-block">${2:User Name}</a>
  </div>
</div>
<!-- /user-panel -->
```

lteside-custom
-----------------------

```html
<div class="sidebar-custom">
  <a href="#" class="btn btn-link"><i class="fas fa-cogs"></i></a>
  <a href="#" class="btn btn-secondary hide-on-collapse pos-right">${1:Help}</a>
</div>
<!-- /.sidebar-custom -->
```
