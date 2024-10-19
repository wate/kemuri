---
prefix: bs-
scope: 
  - twig
  - nunjucks
---
[Bootstrap4(Form)](https://getbootstrap.com/docs/4.6/components/forms/)
=====================

field
--------------------

```html
<div class="form-group">
  <label for="${1}" class="control-label">${2:Input field}</label>
  ${3}
</div>
<!-- /.form-group -->
```

in-text
--------------------

```html
<div class="form-group">
  <label for="${1:text_field}" class="control-label">${2:Text field}</label>
  <input type="text" name="${1:text_field}" id="${1:text_field}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

in-number
--------------------

```html
<div class="form-group">
  <label for="${1:number_field}" class="control-label">${2:Number field}</label>
  <input type="number" name="${1:number_field}" id="${1:number_field}" value="" min="${3:1}" class="form-control">
</div>
<!-- /.form-group -->
```

in-select
--------------------

```html
<div class="form-group">
  <label for="${1:select_field}" class="control-label">${2:Select field}</label>
  <select name="${1:select_field}" id="${1:select_field}" class="form-control">
    <option value="">--</option>
    <option value="">--</option>
  </select>
</div>
<!-- /.form-group -->
```

in-checkbox
--------------------

```html
<div class="form-group">
  <label for="${1:checkbox_field}" class="control-label">${2:Checkbox field}</label>
  <div>
    <div class="form-check">
      <input type="checkbox" name="${1:checkbox_field}[]" value="${3:1}" id="${1:checkbox_field}-${3:1}" class="form-check-input">
      <label class="form-check-label" for="${1:checkbox_field}-${3:1}">${3:1}</label>
    </div>
    <div class="form-check">
      <input type="checkbox" name="${1:checkbox_field}[]" value="${4:2}" id="${1:checkbox_field}-${4:2}" class="form-check-input">
      <label class="form-check-label" for="${1:checkbox_field}-${4:2}">${4:2}</label>
    </div>
  </div>
</div>
<!-- /.form-group -->
```

in-checkbox-inline
--------------------

```html
<div class="form-group">
  <label for="${1:checkbox_field}" class="control-label">${2:Checkbox field}</label>
  <div>
    <div class="form-check form-check-inline">
      <input type="checkbox" name="${1:checkbox_field}[]" value="${3:1}" id="${1:checkbox_field}-${3:1}" class="form-check-input">
      <label class="form-check-label" for="${1:checkbox_field}-${3:1}">${3:1}</label>
    </div>
    <div class="form-check form-check-inline">
      <input type="checkbox" name="${1:checkbox_field}[]" value="${4:2}" id="${1:checkbox_field}-${4:2}" class="form-check-input">
      <label class="form-check-label" for="${1:checkbox_field}-${4:2}">${4:2}</label>
    </div>
  </div>
</div>
<!-- /.form-group -->
```

in-radio
--------------------

```html
<div class="form-group">
  <label for="${1:radio_field}" class="control-label">${2:Radio field}</label>
  <div>
    <div class="form-check">
      <input type="radio" name="${1:radio_field}" value="${3:1}" id="${1:radio_field}-${3:1}" class="form-check-input">
      <label class="form-check-label" for="${1:radio_field}-${3:1}">${3:1}</label>
    </div>
    <div class="form-check">
      <input type="radio" name="${1:radio_field}" value="${4:2}" id="${1:radio_field}-${4:2}" class="form-check-input">
      <label class="form-check-label" for="${1:radio_field}-${4:2}">${4:2}</label>
    </div>
  </div>
</div>
<!-- /.form-group -->
```

in-radio-inline
--------------------

```html
<div class="form-group">
  <label for="${1:radio}" class="control-label">${2:Radio field}</label>
  <div>
    <div class="form-check form-check-inline">
      <input type="radio" name="${1:radio_field}" value="${3:1}" id="${1:radio_field}-${3:1}" class="form-check-input">
      <label class="form-check-label" for="${1:radio_field}-${3:1}">${3:1}</label>
    </div>
    <div class="form-check form-check-inline">
      <input type="radio" name="${1:radio_field}" value="${4:2}" id="${1:radio_field}-${4:2}" class="form-check-input">
      <label class="form-check-label" for="${1:radio_field}-${4:2}">${4:2}</label>
    </div>
  </div>
</div>
<!-- /.form-group -->
```

in-email
--------------------

```html
<div class="form-group">
  <label for="${1:email_field}" class="control-label">${2:Email field}</label>
  <input type="email" name="${1:email_field}" id="${1:email_field}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

in-file
--------------------

```html
<div class="form-group">
  <label for="${1:file_field}" class="control-label">${2:File field}</label>
  <input type="file" name="${1:file_field}" id="${1:file_field}" class="form-control-file" accept="${3:.xlsx,.ods}">
</div>
<!-- /.form-group -->
```

in-tel
--------------------

```html
<div class="form-group">
  <label for="${1:tel_field}" class="control-label">${2:Tel Field}</label>
  <input type="tel" name="${1:tel_field}" id="${1:tel_field}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

in-date
--------------------

```html
<div class="form-group">
  <label for="${1:date_field}" class="control-label">${2:Date Field}</label>
  <input type="date" name="${1:date_field}" id="${1:date_field}" value="" class="form-control" pattern="[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}">
</div>
<!-- /.form-group -->
```

in-time
--------------------

```html
<div class="form-group">
  <label for="${1:time_field}" class="control-label">${2:Time Field}</label>
  <input type="time" name="${1:time_field}" id="${1:time_field}" value="" step="${3:1800}" class="form-control" pattern="[0-9]\{2\}:[0-9]\{2\}">
</div>
<!-- /.form-group -->
```

in-url
-----------

```html
<div class="form-group">
  <label for="${1:url_field}" class="control-label">${2:URL Field}</label>
  <input type="url" name="${1:url_field}" id="${1:url_field}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

in-color
-----------

```html
<div class="form-group">
  <label for="${1:color_field}" class="control-label">${2:Color field}</label>
  <input type="color" name="${1:color_field}" id="${1:color_field}" value="" class="form-control"  pattern="#[a-fA-F0-9]\{6\}">
</div>
<!-- /.form-group -->
```

in-search
-----------

```html
<div class="form-group">
  <label for="${1:search_field}" class="control-label">${2:Search field}</label>
  <input type="search" name="${1:search_field}" id="${1:search_field}" value="" class="form-control">
</div>
<!-- /.form-group -->
```

in-range
-----------

```html
<div class="form-group">
  <label for="${1:range_field}" class="control-label">${2:Range field}</label>
  <input type="range" name="${1:range_field}" id="${1:range_field}" value="" class="form-control-range" min="${2:1}" max="${3:100}" step="${4:1}">
</div>
<!-- /.form-group -->
```

in-area
--------------------

```html
<div class="form-group">
  <label for="${1:textarea_field}" class="control-label">${2:Textarea Field}</label>
  <textarea name="${1:textarea_field}" id="${1:textarea_field}" rows="${3:5}" class="form-control"></textarea>
</div>
<!-- /.form-group -->
```

### VSCode Extra Setting

```yaml
prefix:
  - bsin-textarea
```

in-help
--------------------

```html
<small class="form-text text-muted">${1:help text}</small>
```
