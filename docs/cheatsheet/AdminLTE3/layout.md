---
prefix: lte-
scope: 
  - twig
  - nunjucks
---
AdminLTE(Layout)
=======================

layout
-----------------------

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AppName</title>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5/css/all.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css">
</head>
<body class="hold-transition layout-fixed sidebar-mini">
  <div class="wrapper">
    <!-- Navbar -->
    <nav class="main-header navbar navbar-expand navbar-white navbar-light">
      <!--% include "element/header.twig" %-->
      <!-- Left navbar links -->
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
        <li class="nav-item">
          <a href="/" class="nav-link">Home</a>
        </li>
        <!-- ltehead-item -->
        <!-- ltehead-item-dropdown -->
      </ul>
      <!-- Right navbar links -->
      <ul class="navbar-nav ml-auto">
        <!-- ltehead-search -->
        <!-- ltehead-messages -->
        <!-- ltehead-notifications -->
        <li class="nav-item">
          <a class="nav-link" data-widget="fullscreen" href="#" role="button">
            <i class="fas fa-expand-arrows-alt"></i>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-widget="control-sidebar" data-slide="true" href="#" role="button">
            <i class="fas fa-th-large"></i>
          </a>
        </li>
      </ul>
    </nav>
    <!-- /.navbar -->
    <!-- Main Sidebar Container -->
    <aside class="main-sidebar sidebar-dark-primary elevation-4 layout-fixed">
      <!-- Brand Logo -->
      <a href="/" class="brand-link">
        <img src="https://dummyimage.com/50x50/343a40/ffffff&text=AppName" alt="AppName Logo"
          class="brand-image img-circle elevation-3" style="opacity: .8">
        <span class="brand-text font-weight-light">AppName</span>
      </a>
      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Sidebar Menu -->
        <nav class="mt-2">
          <!--% include "element/sidebar.twig" %-->
          <!-- lteside-user -->
          <!-- lteside-search -->
          <ul class="nav nav-pills nav-sidebar nav-child-indent flex-column" data-widget="treeview" role="menu">
            <!-- lteside-item -->
            <!-- lteside-item-tree -->
            <li class="nav-item">
              <a href="#" class="nav-link">
                <i class="fas fa-question-circle nav-icon"></i>
                <p>FeatureName</p>
              </a>
            </li>
            <!-- /.nav-item -->
          </ul>
        </nav>
      </div>
      <!-- /sidebar -->
    </aside>
    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
      <!-- Main content header -->
      <div class="content-header">
        <div class="container-fluid">
          <div class="row mb-2">
            <!--% block content_header %-->
            <!--% include "element/content/header.twig" %-->
            <div class="col-sm-6">
              <h1 class="m-0">FeatureName</h1>
            </div>
            <div class="col-sm-6">
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb float-sm-right">
                    <li class="breadcrumb-item"><a href="/">Home</a></li>
                    <!--% for breadcrumb in breadcrumbs %-->
                    <li class="breadcrumb-item"><a href="#">FeatureName</a></li>
                    <!--% endfor %-->
                    <li class="breadcrumb-item active" aria-current="page">ActionName</li>
                </ol>
              </nav>
              <!-- /.breadcrumb -->
            </div>
            <!-- /content-header -->
            <!--% endblock %-->
          </div>
        </div>
      </div>
      <!-- Main content -->
      <div class="content">
        <div class="container-fluid">
          <!--% block flash_msg %-->
          <!-- bsalert-success -->
          <!-- bsalert-danger -->
          <!--% endblock %-->
          <!--% block content %-->
          ${1}
          <!--% endblock %-->
        </div>
      </div>
      <!-- /.content -->
    </div>
    <!-- /.content-wrapper -->
    <!-- Control Sidebar -->
    <aside class="control-sidebar control-sidebar-dark">
      <div class="p-3">
        <!--% include "element/aside.twig" %-->
        <h5>Control Panel</h5>
        <p>Control Sidebar Content</p>
      </div>
    </aside>
    <!-- /.control-sidebar -->
    <!-- Main Footer -->
    <footer class="main-footer">
      <!--% include "element/footer.twig" %-->
      <strong>Copyright &copy; 2014-2021 <a href="https://adminlte.io">AdminLTE.io</a>.</strong> All rights reserved.
      <div class="float-right d-none d-sm-inline">
        <strong>Author</strong>
      </div>
    </footer>
  </div>
  <!-- ./wrapper -->
  <script src="https://cdn.jsdelivr.net/npm/jquery@3.6/dist/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js"></script>
</body>
</html>
```

layout-header
-----------------------

[Main Header Component](https://adminlte.io/docs/3.2/components/main-header.html)

```html
<!-- Left navbar links -->
<ul class="navbar-nav">
  <li class="nav-item">
    <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
  </li>
  <li class="nav-item">
    <a href="/" class="nav-link">Home</a>
  </li>
  <!-- ltehead-item -->
  <!-- ltehead-item-dropdown -->
</ul>
<!-- Right navbar links -->
<ul class="navbar-nav ml-auto">
  <!-- ltehead-search -->
  <!-- ltehead-messages -->
  <!-- ltehead-notifications -->
  <li class="nav-item">
    <a class="nav-link" data-widget="fullscreen" href="#" role="button">
      <i class="fas fa-expand-arrows-alt"></i>
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link" data-widget="control-sidebar" data-slide="true" href="#" role="button">
      <i class="fas fa-th-large"></i>
    </a>
  </li>
</ul>
```

layout-sidebar
-----------------------

[Main Sidebar Component](https://adminlte.io/docs/3.2/components/control-sidebar.html)

```html
<!-- lteside-user -->
<!-- lteside-search -->
<ul class="nav nav-pills nav-sidebar nav-child-indent flex-column" data-widget="treeview" role="menu">
  <!-- lteside-item -->
  <!-- lteside-item-tree -->
  <li class="nav-item">
    <a href="#" class="nav-link">
      <i class="fas fa-question-circle nav-icon"></i>
      <p>${1:FeatureName}</p>
    </a>
  </li>
  <!-- /.nav-item -->
</ul>
```

layout-content-header
-----------------------

```html
<div class="col-sm-6">
  <h1 class="m-0">${1:FeatureName}</h1>
</div>
<div class="col-sm-6">
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb float-sm-right">
        <li class="breadcrumb-item"><a href="/">Home</a></li>
        <!--% for breadcrumb in breadcrumbs %-->
        <li class="breadcrumb-item"><a href="#">${1:FeatureName}</a></li>
        <!--% endfor %-->
        <li class="breadcrumb-item active" aria-current="page">${2:ActionName}</li>
    </ol>
  </nav>
</div>
<!-- /content-header -->
```

layout-aside
-----------------------

[Control Sidebar Component](https://adminlte.io/docs/3.2/components/control-sidebar.html)

```html
<h5>コントロールパネル</h5>
<p>Control Sidebar Content</p>
```

layout-footer
-----------------------

```html
<strong>Copyright &copy; 2014-2021 <a href="https://adminlte.io">AdminLTE.io</a>.</strong> All rights reserved.
<div class="float-right d-none d-sm-inline">
  <strong>${1:wate}</strong>
</div>
```
