# 🏰 Stately

[![Crates.io](https://img.shields.io/crates/v/stately.svg)](https://crates.io/crates/stately)
[![Documentation](https://docs.rs/stately/badge.svg)](https://docs.rs/stately)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

> Type-safe state management with entity relationships and CRUD operations

Stately is a Rust framework for managing application configuration and state with built-in support for entity relationships, CRUD operations, serialization, and automatic API generation.

## ✨ Features

- **🎯 Type-Safe**: Compile-time guarantees for entity relationships and state operations
- **🔗 Entity Relationships**: Reference entities inline or by ID with `Link<T>`
- **📝 CRUD Operations**: Built-in create, read, update, delete for all entity types
- **🔄 Serialization**: Full serde support for JSON, YAML, etc.
- **📚 OpenAPI Schema**: Automatic schema generation with `utoipa`
- **🚀 Web Framework Integration**: Optional Axum API generation (more frameworks coming soon)
- **🆔 Time-Sortable IDs**: UUID v7 for naturally ordered entity identifiers

## 🚀 Quick Start

### 1. 🦀 Rust (API)

Add stately to your `Cargo.toml`:

```toml
[dependencies]
stately = "0.3.0"
```

For web API generation with Axum:

```toml
[dependencies]
stately = { version = "0.3.0", features = ["axum"] }
```

### 2. 🌐 Web (React + TypeScript)

Coming soon

## 📖 Example

* For `stately` examples, refer to the [README](stately/README.md) or the [examples](stately/examples).
* For `@stately/ui`, stand by... coming soon.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Documentation](https://docs.rs/stately)
- [Crates.io](https://crates.io/crates/stately)
- [Repository](https://github.com/georgeleepatterson/stately)
- [Issue Tracker](https://github.com/georgeleepatterson/stately/issues)
