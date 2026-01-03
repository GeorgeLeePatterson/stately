# validation

Validation types for schema validation.

This module provides the type definitions for validating data against
Stately schemas. The validation system supports recursive validation
with depth limiting, plugin-based validation hooks, and detailed
error reporting.

## Interfaces

### ValidateArgs

Defined in: [validation.ts:116](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L116)

Context passed to validation hooks in plugins.

Provides all the information needed for a plugin to validate
a value at a specific path in the data structure.

#### Example

```typescript
function customValidation(args: ValidateArgs): ValidationResult | undefined {
  if (args.schema.type === 'string' && typeof args.data !== 'string') {
    return {
      valid: false,
      errors: [{ path: args.path, message: 'Expected string' }]
    };
  }
  return undefined; // Let other validators handle it
}
```

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\>

The StatelySchemas type being validated against

##### Node

`Node` *extends* [`BaseNode`](nodes.md#basenode) = `S`\[`"plugin"`\]\[`"AnyNode"`\]

The schema node type at this location

#### Properties

##### data

> **data**: `any`

Defined in: [validation.ts:123](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L123)

The actual data value to validate

##### options?

> `optional` **options**: [`ValidationOptions`](#validationoptions)

Defined in: [validation.ts:127](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L127)

Validation options controlling behavior

##### path

> **path**: `string`

Defined in: [validation.ts:121](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L121)

JSON path to the current location being validated

##### schema

> **schema**: `Node`

Defined in: [validation.ts:125](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L125)

The schema node defining the expected structure

***

### ValidationError

Defined in: [validation.ts:27](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L27)

Represents a single validation error with location and context.

#### Example

```typescript
const error: ValidationError = {
  path: 'user.email',
  message: 'Invalid email format',
  value: 'not-an-email'
};
```

#### Properties

##### message

> **message**: `string`

Defined in: [validation.ts:31](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L31)

Human-readable description of the validation failure

##### path

> **path**: `string`

Defined in: [validation.ts:29](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L29)

JSON path to the invalid value (e.g., 'user.address.city')

##### value?

> `optional` **value**: `any`

Defined in: [validation.ts:33](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L33)

The actual value that failed validation (optional for security)

***

### ValidationOptions

Defined in: [validation.ts:81](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L81)

Configuration options for validation behavior.

Controls recursion depth, debugging output, and warning callbacks
for deeply nested validation.

#### Example

```typescript
const options: ValidationOptions = {
  maxDepth: 10,
  warnDepth: 5,
  debug: true,
  onDepthWarning: (path, depth) => {
    console.warn(`Deep validation at ${path} (depth: ${depth})`);
  }
};
```

#### Properties

##### debug?

> `optional` **debug**: `boolean`

Defined in: [validation.ts:89](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L89)

Enable verbose debug output during validation

##### depth?

> `optional` **depth**: `number`

Defined in: [validation.ts:83](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L83)

Current recursion depth (used internally)

##### maxDepth?

> `optional` **maxDepth**: `number`

Defined in: [validation.ts:87](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L87)

Maximum allowed recursion depth before stopping validation

##### onDepthWarning()?

> `optional` **onDepthWarning**: (`path`, `depth`) => `void`

Defined in: [validation.ts:91](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L91)

Callback invoked when validation exceeds warnDepth

###### Parameters

###### path

`string`

###### depth

`number`

###### Returns

`void`

##### warnDepth?

> `optional` **warnDepth**: `number`

Defined in: [validation.ts:85](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L85)

Depth at which to trigger warning callback

***

### ValidationResult

Defined in: [validation.ts:56](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L56)

Result of a validation operation.

Contains the overall validity status and an array of any errors
encountered during validation.

#### Example

```typescript
const result: ValidationResult = {
  valid: false,
  errors: [
    { path: 'name', message: 'Required field missing' }
  ]
};

if (!result.valid) {
  result.errors.forEach(err => console.log(`${err.path}: ${err.message}`));
}
```

#### Properties

##### errors

> **errors**: [`ValidationError`](#validationerror)[]

Defined in: [validation.ts:60](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L60)

Array of validation errors (empty if valid is true)

##### valid

> **valid**: `boolean`

Defined in: [validation.ts:58](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L58)

Whether the validated data passed all validation rules

## Type Aliases

### ValidateHook()

> **ValidateHook**\<`S`\> = (`args`) => [`ValidationResult`](#validationresult) \| `undefined`

Defined in: [validation.ts:157](https://github.com/GeorgeLeePatterson/stately/blob/0d63ab56ae8896e8b725857e18af512821f3373f/packages/schema/src/validation.ts#L157)

Validation hook function signature for plugins.

Plugins can provide validation hooks that are called during schema
validation. Returning `undefined` indicates the hook doesn't handle
this validation case and other hooks should be tried.

#### Type Parameters

##### S

`S` *extends* [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\> = [`StatelySchemas`](schema.md#statelyschemas)\<`any`, `any`\>

The StatelySchemas type being validated against

#### Parameters

##### args

[`ValidateArgs`](#validateargs)\<`S`\>

#### Returns

[`ValidationResult`](#validationresult) \| `undefined`

ValidationResult if handled, undefined to pass to next hook

#### Example

```typescript
const dateValidator: ValidateHook = (args) => {
  if (args.schema.format === 'date-time') {
    const date = new Date(args.data);
    if (isNaN(date.getTime())) {
      return {
        valid: false,
        errors: [{ path: args.path, message: 'Invalid date format' }]
      };
    }
    return { valid: true, errors: [] };
  }
  return undefined;
};
```
