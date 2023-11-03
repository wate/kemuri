---
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Form)](https://getbootstrap.com/docs/4.6/components/forms/)
=====================

bsfield
--------------------

```html
<div class="form-group">
  <label for="${1}" class="control-label">${2:Input field}</label>
  ${3}
</div>
<!-- /.form-group -->
```

bsin-text
--------------------

```html
<div class="form-group">
  <label for="${1:text}" class="control-label">${2:Text field}</label>
  <input type="text" name="${1:text}" id="${1:text}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

bsin-number
--------------------

```html
<div class="form-group">
  <label for="${1:number}" class="control-label">${2:Number field}</label>
  <input type="number" name="${1:number}" id="${1:number}" value="" min="${3:1}" class="form-control">
</div>
<!-- /.form-group -->
```

bsin-select
--------------------

```html
<div class="form-group">
  <label for="${1:select}" class="control-label">${2:Select field}</label>
  <select name="${1:select}" id="${1:select}" class="form-control">
    <option value="">--</option>
  </select>
</div>
<!-- /.form-group -->
```

bsin-checkbox
--------------------

```html
<div class="form-group">
  <label for="${1:checkbox}" class="control-label">${2:Checkbox field}</label>
  <div>
    <div class="form-check">
      <input type="checkbox" name="${1:checkbox}[]" value="${3}" id="${1:checkbox}-${3}" class="form-check-input">
      <label class="form-check-label" for="${1:checkbox}-${3}">${4:Option 1}</label>
    </div>
    <div class="form-check">
      <input type="checkbox" name="${1:checkbox}[]" value="${5}" id="${1:checkbox}-${5}" class="form-check-input">
      <label class="form-check-label" for="${1:checkbox}-${5}">${6:Option 2}</label>
    </div>
  </div>
</div>
<!-- /.form-group -->
```

bsin-checkbox-inline
--------------------

```html
<div class="form-group">
  <label for="${1:checkbox}" class="control-label">${2:Checkbox field}</label>
  <div>
    <div class="form-check form-check-inline">
      <input type="checkbox" name="${1:checkbox}[]" value="${3}" id="${1:checkbox}-${3}" class="form-check-input">
      <label class="form-check-label" for="${1:checkbox}-${3}">${4:Option 1}</label>
    </div>
    <div class="form-check form-check-inline">
      <input type="checkbox" name="${1:checkbox}[]" value="${5}" id="${1:checkbox}-${5}" class="form-check-input">
      <label class="form-check-label" for="${1:checkbox}-${5}">${6:Option 2}</label>
    </div>
  </div>
</div>
<!-- /.form-group -->
```

bsin-radio
--------------------

```html
<div class="form-group">
  <label for="${1:radio}" class="control-label">${2:Radio field}</label>
  <div>
    <div class="form-check">
      <input type="radio" name="${1:radio}" value="${3}" id="${1:radio}-${3}" class="form-check-input">
      <label class="form-check-label" for="${1:radio}-${3}">${4:Option 1}</label>
    </div>
    <div class="form-check">
      <input type="radio" name="${1:radio}" value="${5}" id="${1:radio}-${5}" class="form-check-input">
      <label class="form-check-label" for="${1:radio}-${5}">${6:Option 2}</label>
    </div>
  </div>
</div>
<!-- /.form-group -->
```

bsin-radio-inline
--------------------

```html
<div class="form-group">
  <label for="${1:radio}" class="control-label">${2:Radio field}</label>
  <div>
    <div class="form-check form-check-inline">
      <input type="radio" name="${1:radio}" value="${3}" id="${1:radio}-${3}" class="form-check-input">
      <label class="form-check-label" for="${1}-${3}">${4:Option 1}</label>
    </div>
    <div class="form-check form-check-inline">
      <input type="radio" name="${1:radio}" value="${5}" id="${1:radio}-${5}" class="form-check-input">
      <label class="form-check-label" for="${1:radio}-${5}">${6:Option 2}</label>
    </div>
  </div>
</div>
<!-- /.form-group -->
```

bsin-email
--------------------

```html
<div class="form-group">
  <label for="${1:email}" class="control-label">${2:Email field}</label>
  <input type="email" name="${1:email}" id="${1:email}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

bsin-file
--------------------

```html
<div class="form-group">
  <label for="${1:file}" class="control-label">${2:File field}</label>
  <input type="file" name="${1:file}" id="${1:file}" class="form-control-file" accept="${3:.xlsx,.ods}">
</div>
<!-- /.form-group -->
```

bsin-tel
--------------------

```html
<div class="form-group">
  <label for="${1:tel}" class="control-label">${2:Tel Field}</label>
  <input type="tel" name="${1:tel}" id="${1:tel}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

bsin-date
--------------------

```html
<div class="form-group">
  <label for="${1:birthday}" class="control-label">${2:Date Field}</label>
  <input type="date" name="${1:birthday}" id="${1:birthday}" value="" class="form-control" pattern="[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}">
</div>
<!-- /.form-group -->
```

bsin-time
--------------------

```html
<div class="form-group">
  <label for="${1:time}" class="control-label">${2:Time Field}</label>
  <input type="time" name="${1:time}" id="${1:time}" value="" step="${2:1800}" class="form-control" pattern="[0-9]\{2\}:[0-9]\{2\}">
</div>
<!-- /.form-group -->
```

bsin-url
-----------

```html
<div class="form-group">
  <label for="${1:url}" class="control-label">${2:URL Field}</label>
  <input type="url" name="${1:url}" id="${1:url}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

bsin-color
-----------

```html
<div class="form-group">
  <label for="${1:color}" class="control-label">${2:Color field}</label>
  <input type="color" name="${1:color}" id="${1:color}" value="" class="form-control"  pattern="#[a-fA-F0-9]\{6\}">
</div>
<!-- /.form-group -->
```

bsin-search
-----------

```html
<div class="form-group">
  <label for="${1:keyword}" class="control-label">${2:Search field}</label>
  <input type="search" name="${1:keyword}" id="${1:keyword}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

bsin-range
-----------

```html
<div class="form-group">
  <label for="${1:range}" class="control-label">${2:Range field}</label>
  <input type="range" name="${1:range}" id="${1:range}" value="" class="form-control-range" min="${2:1}" max="${3:100}" step="${4:1}">
</div>
<!-- /.form-group -->
```

bsin-area
--------------------

```html
<div class="form-group">
  <label for="${1:textarea}" class="control-label">${2:Textarea Field}</label>
  <textarea name="${1:textarea}" id="${1:textarea}" rows="${3:5}" class="form-control"></textarea>
</div>
<!-- /.form-group -->
```

### VSCode Extra Setting

```yaml
prefix:
  - bsin-textarea
```

bsin-help
--------------------

```html
<small class="form-text text-muted">${1:help text}</small>
```
