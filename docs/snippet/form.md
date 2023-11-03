---
scope: 
  - twig
  - nunjucks
---
HTML(form)
=================

frm-get
-----------

```html
<form action="${1}" method="get">${2}</form>
```

frm-post
-----------

```html
<form action="${1}" method="post">${2}</form>
```

frm-multipart
-----------

```html
<form action="${1}" method="post" enctype="multipart/form-data">${2}</form>
```

in-text
-----------

```html
<input type="text" name="${1:name}" id="${1:name}" value="">
```

in-number
-----------

```html
<input type="number" name="${1:number}" id="${1:number}" value="" min="${2:1}">
```

in-select
-----------

```html
<select name="${1:select}" id="${1:select}">
  <option value="">--</option>
</select>
```

in-option
-----------

```html
<option value="${1}">${2}</option>
```

in-checkbox
-----------

```html
<input type="checkbox" name="${1}[]" value="${2}" id="${1}-${2}">
<label for="${1}-${2}">${3:Checkbox}</label>
```

in-radio
-----------

```html
<input type="radio" name="${1}" value="${2}" id="${1}-${2}">
<label for="${1}-${2}">${3:Radio}</label>
```

in-email
-----------

```html
<input type="email" name="${1:email}" id="${1:email}" value="">
```

in-hidden
-----------

```html
<input type="hidden" name="${1:hidden}" id="${1:hidden}" value="${2}">
```

in-file
-----------

```html
<input type="file" name="${1:file}" id="${1:file}" accept="${2:image/*}">
```

in-tel
-----------

```html
<input type="tel" name="${1:tel}" id="${1:tel}" value="">
```

in-date
-----------

```html
<input type="date" name="${1:birthday}" id="${1:birthday}" value="" pattern="[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}">
```

in-time
-----------

```html
<input type="time" name="${1:time}" id="${1:time}" value="" step="${2:1800}" pattern="[0-9]\{2\}:[0-9]\{2\}">
```

in-url
-----------

```html
<input type="url" name="${1:url}" id="${1:url}" value="">
```

in-color
-----------

```html
<input type="color" name="${1:color}" id="${1:color}" value="" pattern="#[a-fA-F0-9]\{6\}">
```

in-range
-----------

```html
<input type="range" name="${1:range}" id="${1:range}" value="" min="${2:1}" max="${3:100}" step="${4:1}">
```

in-search
-----------

```html
<input type="search" name="${1:keyword}" id="${1:keyword}" value="">
```

in-area
-----------

```html
<textarea name="${1:textarea}" id="${1:textarea}" rows="${2:5}"></textarea>
```

### VSCode Extra Setting

```yaml
prefix:
  - in-textarea
```

btn-submit
-----------

```html
<button type="submit">${1:submit}</button>
```

btn-button
-----------

```html
<button type="button">${1:button}</button>
```

btn-reset
-----------

```html
<button type="reset">${1:reset}</button>
```
