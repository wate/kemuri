---
prefix: lte-
scope: 
  - twig
  - nunjucks
---
AdminLTE(Page)
=======================

page-login
-----------------------

<https://adminlte.io/themes/v3/pages/examples/login-v2.html>

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${1:AppName}</title>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5/css/all.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css">
</head>
<body class="hold-transition login-page">
  <div class="login-box">
    <!-- bsalert-danger -->
    <div class="card card-outline card-primary">
      <div class="card-header text-center">
        <h1>${1:AppName}</h1>
      </div>
      <div class="card-body login-card-body">
        <p class="login-box-msg">ログインしてください。</p>
        <form method="post" accept-charset="utf-8" role="form" action="${2:#}">
          <div class="form-group text">
            <div class="input-group">
              <input type="text" name="login_name" placeholder="ログイン名" id="login_name" aria-label="ログイン名"
                class="form-control" />
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="fas fa-user"></i>
                </span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <div class="input-group">
              <input type="password" name="login_password" placeholder="パスワード" id="login_password" aria-label="パスワード"
                class="form-control" />
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="fas fa-lock"></i>
                </span>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-8">
              <div class="form-group custom-control custom-checkbox checkbox">
                <input type="hidden" name="remember_me" value="0" />
                <input type="checkbox" name="remember_me" value="1" id="remember_me" class="custom-control-input">
                <label class="custom-control-label" for="remember_me">
                  ログイン情報を記憶する
                </label>
              </div>
            </div>
            <div class="col-4">
              <div class="submit">
                <input type="submit" class="btn btn-primary btn-block" id="login" value="ログイン" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- /.login-box -->
  <script src="https://cdn.jsdelivr.net/npm/jquery@3.6/dist/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js"></script>
</body>
</html>
```
