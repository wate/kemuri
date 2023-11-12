---
scope: 
  - twig
  - nunjucks
---
AdminLTE(Content)
=======================

ltecontent-list
-----------------------

```html
<div class="row">
  <div class="col">
    <div class="card card-outline">
      <div class="card-header">
        <h3 class="card-title">List</h3>
        <div class="card-tools">
          <a href="#" class="btn btn-primary btn-sm">新規登録</a>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Id</th>
                <th scope="col">Name</th>
                <th scope="col">Code</th>
                <th scope="col">Email</th>
                <th scope="col" class="col-2">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>SampleUser</td>
                <td>sample</td>
                <td>sample@example.com</td>
                <td>
                  <a href="#" class="btn btn-outline-primary btn-sm">編集</a>
                  <a href="#" class="btn btn-outline-info btn-sm">表示</a>
                  <button type="button" class="btn btn-outline-danger btn-sm">削除</button>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- /.table -->
        </div>
        <!-- /.table-responsive-->
      </div>
      <div class="card-footer">
        <div class="row">
          <div class="col">
            &nbsp;
          </div>
          <div class="col">
            <ul class="pagination pagination-sm float-right">
              <li class="page-item disabled"><a class="page-link" href="#">前へ</a></li>
              <li class="page-item active"><a class="page-link" href="#">1</a></li>
              <li class="page-item"><a class="page-link" href="#">2</a></li>
              <li class="page-item"><a class="page-link" href="#">3</a></li>
              <li class="page-item"><a class="page-link" href="#">次へ</a></li>
            </ul>
            <!-- /.pagination-->
          </div>
        </div>
        <!-- /.row -->
      </div>
    </div>
    <!-- /.card -->
  </div>
</div>
<!-- /.row -->
```
