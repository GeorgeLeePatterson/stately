# Validation System - @stately/schema

## Overview

The `@stately/schema` package provides a comprehensive, production-ready validation system for deeply nested schema structures. This system has been designed to be **fast, maintainable, and suitable for open-source library distribution**.

## Key Improvements Over xeo4

### 1. **Structured Error Reporting**
- Returns `ValidationResult` with detailed error paths instead of just `boolean`
- Each error includes:
  - `path`: Exact location of invalid data (e.g., `"pipeline.source.buffer_size"`)
  - `message`: Human-readable error description
  - `value`: The invalid value for debugging

### 2. **Path-Based Tracking**
- Uses proper dot-notation paths (`"parent.child.field"`)
- Array indices: `"items[0].name"`
- No more confusing label strings like `"object-property-name-object-label"`

### 3. **Depth Management**
- **Warning threshold**: 15 levels (configurable)
- **Maximum depth**: 20 levels (configurable)
- Errors on exceeding max depth (prevents data loss)
- Optional callback for depth warnings

### 4. **Memoization Support**
- `createValidationCacheKey()` generates stable cache keys
- Enables React.useMemo optimization in UI components
- Cache keys based on path + data hash

### 5. **Comprehensive Node Type Coverage**
- **Object**: Full recursive validation
- **Array**: Validates all items with indexed paths
- **Map**: Validates all values with keyed paths
- **TaggedUnion**: Validates discriminator and variant schemas
- **UntaggedEnum**: Validates variant data with proper error messages
- **Nullable**: Handles null/undefined correctly
- **Primitives, Enums, Links, etc.**: Pass-through (presence validated at parent)

### 6. **Optional Debug Logging**
- Debug logs gated behind `options.debug` flag
- Production-safe (no console spam)
- Structured logging with paths and node types

## API Reference

### Types

```typescript
interface ValidationError {
  /** Path to the invalid field (e.g., 'pipeline.source.buffer_size') */
  path: string;
  /** Error message */
  message: string;
  /** The invalid value */
  value?: any;
}

interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: ValidationError[];
}

interface ValidationOptions {
  /** Current recursion depth (internal, auto-managed) */
  depth?: number;
  /** Maximum depth before warning (default: 15) */
  warnDepth?: number;
  /** Maximum depth before error (default: 20) */
  maxDepth?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Callback for depth warnings */
  onDepthWarning?: (path: string, depth: number) => void;
}
```

### Functions

#### `validateSchema(path, data, schema, options?)`

Validates data against any schema node.

```typescript
const result = integration.validateSchema(
  'pipeline',           // path
  pipelineData,         // data to validate
  pipelineSchema,       // schema node
  {
    debug: true,        // optional: enable logging
    warnDepth: 10,      // optional: warn at depth 10
    maxDepth: 15,       // optional: error at depth 15
    onDepthWarning: (path, depth) => {
      console.warn(`Deep nesting at ${path}: ${depth} levels`);
    }
  }
);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // Example errors:
  // [
  //   {
  //     path: 'pipeline.source.buffer_size',
  //     message: "Field 'buffer_size' is required",
  //     value: undefined
  //   }
  // ]
}
```

#### `validateObject(path, data, schema, options?)`

Validates an object against an ObjectNode schema.

```typescript
const result = integration.validateObject(
  'source_config',
  sourceConfigData,
  sourceConfigSchema,
  { debug: false }
);
```

#### `validateObjectField(parentPath, fieldName, fieldValue, fieldSchema, isRequired, options?)`

Validates a single field within an object.

```typescript
const result = integration.validateObjectField(
  'pipeline',          // parent path
  'name',             // field name
  pipelineData.name,  // field value
  nameFieldSchema,    // field schema
  true,               // is required
  { debug: false }
);
```

#### `createValidationCacheKey(path, data)`

Creates a stable cache key for memoization.

```typescript
const cacheKey = integration.createValidationCacheKey('pipeline', pipelineData);
// Returns: "pipeline:{...json stringified data...}"

// Use with React.useMemo:
const validationResult = React.useMemo(
  () => integration.validateSchema('pipeline', data, schema),
  [integration.createValidationCacheKey('pipeline', data)]
);
```

## Usage Examples

### Basic Validation

```typescript
import { createOpenAPIIntegration } from '@stately/schema';
import openapi from './openapi.json';
import { PARSED_SCHEMAS } from './generated-schemas';

const integration = createOpenAPIIntegration(openapi, PARSED_SCHEMAS);

// Validate an entity
const result = integration.validateSchema(
  'pipeline',
  pipelineData,
  integration.entitySchemaCache['pipeline']
);

if (result.valid) {
  console.log('✓ Valid pipeline');
} else {
  result.errors.forEach(error => {
    console.error(`✗ ${error.path}: ${error.message}`);
  });
}
```

### React Component with Memoization

```typescript
import { useMemo } from 'react';

function EntityForm({ entityType, data, schema }) {
  // Memoize validation to avoid recalculating on every render
  const validationResult = useMemo(
    () => integration.validateSchema(entityType, data, schema),
    [integration.createValidationCacheKey(entityType, data)]
  );

  return (
    <div>
      {!validationResult.valid && (
        <div className="errors">
          {validationResult.errors.map(error => (
            <div key={error.path}>
              {error.path}: {error.message}
            </div>
          ))}
        </div>
      )}
      
      <button disabled={!validationResult.valid}>
        Save
      </button>
    </div>
  );
}
```

### Depth Warning Callback

```typescript
const result = integration.validateSchema(
  'complex_entity',
  complexData,
  complexSchema,
  {
    warnDepth: 10,
    maxDepth: 20,
    onDepthWarning: (path, depth) => {
      // Send to monitoring/analytics
      analytics.track('deep_validation', { path, depth });
      
      // Show user warning
      toast.warning(`Complex nesting detected at ${path} (${depth} levels)`);
    }
  }
);
```

### Incremental Validation (Field-Level)

Instead of validating the entire tree on every keystroke, validate only the changed field:

```typescript
function handleFieldChange(fieldName: string, newValue: any) {
  // Only validate the changed field
  const fieldResult = integration.validateObjectField(
    'pipeline',           // parent path
    fieldName,            // field that changed
    newValue,             // new value
    schema.properties[fieldName],
    requiredFields.has(fieldName)
  );

  // Update field-specific error state
  setFieldErrors(prev => ({
    ...prev,
    [fieldName]: fieldResult.errors
  }));
  
  // Update form data
  setFormData(prev => ({ ...prev, [fieldName]: newValue }));
}
```

### Debounced Validation

For performance in complex forms, debounce validation:

```typescript
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

function EntityForm({ data, schema }) {
  const [validationResult, setValidationResult] = useState({ valid: true, errors: [] });

  // Debounce validation by 300ms
  const debouncedValidate = useCallback(
    debounce((data) => {
      const result = integration.validateSchema('entity', data, schema);
      setValidationResult(result);
    }, 300),
    [schema]
  );

  useEffect(() => {
    debouncedValidate(data);
  }, [data, debouncedValidate]);

  // ...
}
```

## Migration from xeo4

### Old API (xeo4)

```typescript
// Returns boolean, no error details
const isValid = validateObject('label', formData, node, 0);

if (!isValid) {
  // No information about WHAT is invalid
  console.error('Validation failed');
}
```

### New API (@stately/schema)

```typescript
// Returns structured result with error details
const result = integration.validateObject('pipeline', formData, node);

if (!result.valid) {
  // Detailed error information
  result.errors.forEach(error => {
    console.error(`${error.path}: ${error.message}`, error.value);
  });
}
```

### Signature Changes

| Old (xeo4) | New (@stately/schema) |
|------------|----------------------|
| `validateObject(label, data, schema, depth)` | `validateObject(path, data, schema, options?)` |
| `validateSchema(label, data, schema, depth)` | `validateSchema(path, data, schema, options?)` |
| `validateObjectField(label, fieldName, value, schema, required, depth)` | `validateObjectField(parentPath, fieldName, value, schema, required, options?)` |
| Returns `boolean` | Returns `ValidationResult` |

### Behavioral Changes

1. **Depth limit increased**: 10 → 20 (with warning at 15)
2. **Errors on exceeding depth**: Previously returned `true` (silently passed), now returns error
3. **Array validation enabled**: Previously disabled in xeo4, now fully validates array items
4. **Map validation enabled**: Now validates all map values recursively
5. **TaggedUnion validation**: Now validates discriminator and variant schemas
6. **Debug logging**: Off by default, enable with `options.debug = true`

## Performance Characteristics

### Time Complexity
- **Best case**: O(1) - primitive/enum fields
- **Average case**: O(n) - where n = number of fields in object tree
- **Worst case**: O(n * d) - where d = depth (limited to 20)

### Space Complexity
- **O(d)** - recursion stack depth
- **O(e)** - error accumulation, where e = number of errors

### Optimization Strategies

1. **Memoization**: Use `createValidationCacheKey()` with React.useMemo
2. **Debouncing**: Validate on blur or with 200-300ms debounce
3. **Incremental**: Validate only changed fields, not entire tree
4. **Lazy**: Only validate required fields until user interacts

## Future Enhancements

Potential additions (not yet implemented):

- [ ] **Schema compilation**: Pre-compile validation rules for faster execution
- [ ] **Async validation**: Support async validators (e.g., uniqueness checks)
- [ ] **Custom validators**: Allow user-defined validation functions
- [ ] **Validation caching**: Built-in LRU cache for validation results
- [ ] **Partial validation**: Validate subset of paths efficiently
- [ ] **Error recovery**: Suggest fixes for common validation errors

## Contributing

When adding new node types or validation rules:

1. Add the validation logic to `validateSchema()` switch statement
2. Return `ValidationResult` with proper error paths
3. Add test cases for the new validation
4. Update this documentation

---

**Package**: `@stately/schema`  
**Version**: 0.3.0  
**License**: Apache-2.0
