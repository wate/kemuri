---
scope: 
  - twig
  - nunjucks
---
HTML(form)
=================

form
-----------

```html
<form action="${1:#}" method="get">${2}</form>
```

### VSCode Extra Setting

```yaml
prefix:
  - form-get
```

form-post
-----------

```html
<form action="${1:#}" method="post">${2}</form>
```

form-multipart
-----------

```html
<form action="${1:#}" method="post" enctype="multipart/form-data">${2}</form>
```

input
-----------

```html
<input type="text" name="${1:text_field}" id="${1:text_field}" value="${2}">
```

### VSCode Extra Setting

```yaml
prefix:
  - input-text
```

input-number
-----------

```html
<input type="number" name="${1:number_field}" id="${1:number_field}" value="" min="${2:1}">
```

input-select
-----------

```html
<select name="${1:select_field}" id="${1:select_field}">
  <option value="">--</option>
</select>
```

input-option
-----------

```html
<option value="${1}">${2:Option}</option>
```

input-checkbox
-----------

```html
<input type="checkbox" name="${1:checkbox_field}[]" value="${2}" id="${1:checkbox_field}-${2}">
<label for="${1:checkbox_field}-${2:1}">${3:Checkbox}</label>
```

input-radio
-----------

```html
<input type="radio" name="${1:radio_field}" value="${2}" id="${1:radio_field}-${2}">
<label for="${1:radio_field}-${2}">${3:Radio}</label>
```

input-email
-----------

```html
<input type="email" name="${1:email_field}" id="${1:email_field}" value="">
```

input-hidden
-----------

```html
<input type="hidden" name="${1:hidden_field}" id="${1:hidden_field}" value="${2}">
```

input-file
-----------

```html
<input type="file" name="${1:file_field}" id="${1:file_field}" accept="${2:image/*}">
```

input-tel
-----------

```html
<input type="tel" name="${1:tel_field}" id="${1:tel_field}" value="">
```

input-date
-----------

```html
<input type="date" name="${1:date_field}" id="${1:date_field}" value="" pattern="[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}">
```

input-time
-----------

```html
<input type="time" name="${1:time_field}" id="${1:time_field}" value="" step="${2:1800}" pattern="[0-9]\{2\}:[0-9]\{2\}">
```

input-url
-----------

```html
<input type="url" name="${1:url_field}" id="${1:url_field}" value="">
```

input-color
-----------

```html
<input type="color" name="${1:color_field}" id="${1:color_field}" value="" pattern="#[a-fA-F0-9]\{6\}">
```

input-range
-----------

```html
<input type="range" name="${1:range_field}" id="${1:range_field}" value="" min="${2:1}" max="${3:100}" step="${4:1}">
```

input-search
-----------

```html
<input type="search" name="${1:search_field}" id="${1:search_field}" value="">
```

input-area
-----------

```html
<textarea name="${1:textarea_field}" id="${1:textarea_field}" rows="${2:5}"></textarea>
```

### VSCode Extra Setting

```yaml
prefix:
  - input-textarea
```

btn
-----------

```html
<button type="${1|submit,button,reset|}">${2:Button}</button>
```

btn-submit
-----------

```html
<button type="submit">${1:Submit}</button>
```

btn-button
-----------

```html
<button type="button">${1:Button}</button>
```

btn-reset
-----------

```html
<button type="reset">${1:Reset}</button>
```
