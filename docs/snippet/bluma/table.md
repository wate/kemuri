[Bulma(Elements/Table)](https://bulma.io/documentation/elements/table/)
=====================

blmtable
--------

```html
<table class="table">
  <thead>
    <tr>
      <th><abbr title="Position">Pos</abbr></th>
      <th>Team</th>
      <th><abbr title="Played">Pld</abbr></th>
      <th><abbr title="Won">W</abbr></th>
      <th><abbr title="Drawn">D</abbr></th>
      <th><abbr title="Lost">L</abbr></th>
      <th><abbr title="Goals for">GF</abbr></th>
      <th><abbr title="Goals against">GA</abbr></th>
      <th><abbr title="Goal difference">GD</abbr></th>
      <th><abbr title="Points">Pts</abbr></th>
      <th>Qualification or relegation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td><a href="https://en.wikipedia.org/wiki/Leicester_City_F.C." title="Leicester City F.C.">Leicester City</a> <strong>(C)</strong>
      </td>
      <td>38</td>
      <td>23</td>
      <td>12</td>
      <td>3</td>
      <td>68</td>
      <td>36</td>
      <td>+32</td>
      <td>81</td>
      <td>Qualification for the <a href="https://en.wikipedia.org/wiki/2016%E2%80%9317_UEFA_Champions_League#Group_stage" title="2016–17 UEFA Champions League">Champions League group stage</a></td>
    </tr>
    <tr  class="is-selected">
      <th>2</th>
      <td><a href="https://en.wikipedia.org/wiki/Arsenal_F.C." title="Arsenal F.C.">Arsenal</a></td>
      <td>38</td>
      <td>20</td>
      <td>11</td>
      <td>7</td>
      <td>65</td>
      <td>36</td>
      <td>+29</td>
      <td>71</td>
      <td>Qualification for the <a href="https://en.wikipedia.org/wiki/2016%E2%80%9317_UEFA_Champions_League#Group_stage" title="2016–17 UEFA Champions League">Champions League group stage</a></td>
    </tr>
  </tbody>
</table>
```

blmtable-container
--------

You can create a scrollable table by wrapping a table in a table-container element:

```html
<div class="table-container">
    <table class="table">
        <!-- Your table content -->
    </table>
</div>
```

blmtable-bordered
--------

```html
<table class="table is-bordered">
    <!-- Your table content -->
</table>
```

blmtable-striped
--------

```html
<table class="table is-striped">
    <!-- Your table content -->
</table>
```

blmtable-narrow
--------

```html
<table class="table is-narrow">
    <!-- Your table content -->
</table>
```

blmtable-hoverable
--------

```html
<table class="table is-hoverable">
    <!-- Your table content -->
</table>
```

blmtable-fullwidth
--------

```html
<table class="table is-fullwidth">
    <!-- Your table content -->
</table>
```

blmtable-full
--------

```html
<table class="table table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
    <!-- Your table content -->
</table>
```
