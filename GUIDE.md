## Example 1

### `Model.scss`

**Good**
```scss
.Model {
  .Text {
    font-family: 'Helvetica Neue', sans-serif;
  }
}
```

**Bad**
```scss
.Model {
  .Text {
    font-family: 'Helvetica Neue', sans-serif;
  }
}

// In same file another same class name

.Text {
  font-family: 'Helvetica Neue', sans-serif;
}
```

This creates a namespace conflict with the class "Text". Styles will fail.
I'd recommend one doesn't use the same class name except when absolutely
necessary.

## Example 2

Imagine these 2 files:

### `Model.scss`
```scss
.Model {
  .Text {
    font-family: 'Helvetica Neue', sans-serif;
  }
}
```

### `Typograph.scss`
```scss
body, html {
  .Text {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
  }
}
```

When you theme them and use "Text" module on both:
### `Modal.tsx`

```js
import * as React from 'react'
import { themed } from 'react-themed-too'

const Modal = ({theme, ...props}) => {
  return (
    <div className={theme.Modal}>
      <p className={theme.Text}>Some random text</p>
    </div>
  )
}

export default themed(/Text/)(Button)
```

### `Button.tsx`

```js
import * as React from 'react'
import { themed } from 'react-themed-too'

const Button = ({theme, ...props}) => {
  return (
    <button className={theme.Text}>
      Press Me
    </button>
  )
}

export default themed(/Text/)(Button)
```

The final compiled dom node will look like this:

```html
<div class="Model_Model__reaacthemed-7jd9-">
  <p class="Model_Model_Text__reactthemed-45hbk3 Typography_Text__reactthemed-73jhd">
    Some random text
  </p>
</div>
<button class="Model_Model_Text__reactthemed-45hbk3 Typography_Text__reactthemed-73jhd">
  Press Me
</button>
```
Because CSS Modules aren't aware of SCSS nesting. So it'll apply both to be safe, and the CSS
will work fine because of specificity, but you don't want to "stack" classes needlessly. It's
better to namespace:

### `Model.scss`
```scss
.Model {
  &__Text {
    font-family: 'Helvetica Neue', sans-serif;
  }
}
```

### `Typograph.scss`
```scss
body, html {
  .Text {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
  }
}
```

### `Modal.tsx`

```js
import * as React from 'react'
import { themed } from 'react-themed-too'

const Modal = ({theme, ...props}) => {
  return (
    <div className={theme.Modal}>
      <p className={theme.Modal__Text}>Some random text</p>
    </div>
  )
}

export default themed(/Text/)(Button)
```

### `Button.tsx`

```js
import * as React from 'react'
import { themed } from 'react-themed-too'

const Button = ({theme, ...props}) => {
  return (
    <button className={theme.Text}>
      Press Me
    </button>
  )
}

export default themed(/Text/)(Button)
```

Final dom node:
```html
<div class="Model_Model__reaacthemed-7jd9-">
  <p class="Model_Model_Text__reactthemed-45hbk3">
    Some random text
  </p>
</div>
<button class="Typography_Text__reactthemed-73jhd">
  Press Me
</button>
```