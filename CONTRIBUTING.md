# Contributing to stately

Thank you for your interest in contributing to stately! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Run tests and ensure they pass
6. Submit a pull request

## Development Setup

### Prerequisites

- Rust 1.70+ (we use the 2024 edition)
- Node 22+

### Building

```bash
# Build the project
cargo build

# Build with release optimizations
cargo build --release

# Check the typescript of the UI
pnpm check

# Build the UI
pnpm build
```

### Testing

```bash
# Run all tests (requires Docker for integration tests)
just test
# Or
cargo test
```

### Code Quality

Before submitting a PR, please ensure:

```bash
# Format code
cargo +nightly fmt

# Run the checks the CI will perform (and some extra)
just checks
# or
# Run clippy
cargo +nightly clippy --all-features --all-targets

# Check for security issues
cargo audit
```

## Guidelines

### Code Style

- Follow Rust standard formatting (use `cargo +nightly fmt`, pedantic linting is used)
- Write clear, self-documenting code
- Add documentation comments for public APIs
- Include examples in documentation where appropriate

### Commit Messages

- Use clear, descriptive commit messages
- Follow conventional commit format when possible:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `test:` for test additions/changes
  - `refactor:` for code refactoring
  - `perf:` for performance improvements

### Pull Requests

1. **Keep PRs focused**: One feature or fix per PR
2. **Write tests**: Include tests for new functionality
3. **Update documentation**: Keep docs in sync with code changes
4. **Add examples**: For significant features, add examples
5. **Benchmark if needed**: For performance-critical changes

### Testing

- Unit tests go inline with modules
- All tests must pass before merging
- Aim for high test coverage

## Architecture Overview

Key components:

- **TODO** (`src/todo`): Todo

## Reporting Issues

When reporting issues, please include:

- Rust version (`rustc --version`)
- Node version (`node --version`)
- Minimal reproducible example
- Error messages and stack traces
- Expected vs actual behavior

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.
