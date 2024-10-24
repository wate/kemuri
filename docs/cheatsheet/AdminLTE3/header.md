---
prefix: lte-
scope: 
  - twig
  - nunjucks
---

[AdminLte(Header)](https://adminlte.io/docs/3.2/components/main-header.html)
=======================

header-item
-----------------------

```html
<li class="nav-item">
  <a href="${1:#}" class="nav-link">${2:Item}</a>
</li>
<!-- /.nav-item -->
```

header-item-dropdown
-----------------------

```html
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="#" id="${1:Help}" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    ${1:Help}
  </a>
  <div class="dropdown-menu" aria-labelledby="${1}">
    <a class="dropdown-item" href="#">${2:FAQ}</a>
    <a class="dropdown-item" href="#">${3:Support}</a>
    <div class="dropdown-divider"></div>
    <a class="dropdown-item" href="#">${4:Contact}</a>
  </div>
</li>
<!-- /.dropdown -->
```

header-search
-----------------------

```html
<li class="nav-item">
  <a class="nav-link" data-widget="navbar-search" href="#" role="button">
    <i class="fas fa-search"></i>
  </a>
  <div class="navbar-search-block">
    <form class="form-inline" action="${1:#}">
      <div class="input-group input-group-sm">
        <input class="form-control form-control-navbar" type="search" name="keyword" id="header-search" placeholder="keyword" aria-label="Search">
        <div class="input-group-append">
          <button class="btn btn-navbar" type="submit">
            <i class="fas fa-search"></i>
          </button>
          <button class="btn btn-navbar" type="button" data-widget="navbar-search">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </form>
  </div>
</li>
<!-- /search -->
```

header-messages
-----------------------

```html
<li class="nav-item dropdown">
  <a class="nav-link" data-toggle="dropdown" href="#">
    <i class="far fa-comments"></i>
    <span class="badge badge-danger navbar-badge">3</span>
  </a>
  <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
    <!--% for message in messages %-->
    <a href="#" class="dropdown-item">
      <div class="media">
        <img src="https://dummyimage.com/128x128/" alt="User Avatar" class="img-size-50 mr-3 img-circle">
        <div class="media-body">
          <h3 class="dropdown-item-title">
            Brad Diesel
            <span class="float-right text-sm text-danger"><i class="fas fa-star"></i></span>
          </h3>
          <p class="text-sm">Call me whenever you can...</p>
          <p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
        </div>
      </div>
    </a>
    <div class="dropdown-divider"></div>
    <!--% endfor %-->
    <a href="#" class="dropdown-item dropdown-footer">See All Messages</a>
  </div>
</li>
<!-- /messages -->
```

header-notifications
-----------------------

```html
<li class="nav-item dropdown">
  <a class="nav-link" data-toggle="dropdown" href="#">
    <i class="far fa-bell"></i>
    <span class="badge badge-warning navbar-badge">15</span>
  </a>
  <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
    <span class="dropdown-header">15 Notifications</span>
    <div class="dropdown-divider"></div>
    <!--% for notification in notifications %-->
    <a href="#" class="dropdown-item">
      <i class="fas fa-envelope mr-2"></i> 4 new messages
      <span class="float-right text-muted text-sm">3 mins</span>
    </a>
    <div class="dropdown-divider"></div>
    <!--% endfor %-->
    <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
  </div>
</li>
<!-- /notifications -->
```
