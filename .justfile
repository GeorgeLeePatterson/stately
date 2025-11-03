LOG := env('RUST_LOG', '')

# List of features
features := 'openapi axum'

# List of Examples

examples := "basic axum_api"

default:
    @just --list

# --- TESTS ---

test-unit:
    cargo test --lib -F axum -- --nocapture --show-output

# Runs unit tests first then integration
test:
    cargo test -- --nocapture --show-output
    cargo test -F axum -- --nocapture --show-output

test-one test_name:
    cargo test -F axum "{{ test_name }}" -- --nocapture --show-output

# --- COVERAGE ---

coverage:
    cargo llvm-cov --html \
     --ignore-filename-regex "(errors|examples|stately-derive).*" \
     --output-dir coverage -F axum --open

coverage-lcov:
    cargo llvm-cov --lcov \
     --ignore-filename-regex "(errors|examples|stately-derive).*" \
     --output-path coverage/lcov.info -F axum

# --- EXAMPLES ---

examples:
    cargo run -F axum --example "basic"
    cargo run -F axum --example "axum_api"

example example:
    cargo run -F axum --example "{{ example }}"

# --- DOCS ---

docs:
    cargo doc --open

# --- MAINTENANCE ---

# Run checks CI will
checks:
    cargo +nightly fmt -- --check
    cargo +stable clippy --all-features --all-targets -- -D warnings
    cargo +nightly clippy --all-features --all-targets
    just -f {{justfile()}} test

# Check for outdated dependencies
check-outdated:
    cargo outdated

# Run security audit
audit:
    cargo audit

# Prepare a release (creates PR with version bumps and changelog)
prepare-release version:
    #!/usr/bin/env bash
    set -euo pipefail

    # Validate version format
    if ! [[ "{{version}}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Error: Version must be in format X.Y.Z (e.g., 0.2.0)"
        exit 1
    fi

    # Make sure git cliff is installed
    git cliff --version || (echo "Error: git cliff is not installed" && exit 1)

    # Parse version components
    IFS='.' read -r MAJOR MINOR PATCH <<< "{{version}}"

    # Get current version for release notes
    CURRENT_VERSION=$(grep -E '^version = ' Cargo.toml | head -1 | sed 's/version = "\(.*\)"/\1/')

    # Create release branch
    git checkout -b "release-v{{version}}"

    # Update workspace version in root Cargo.toml (only in [workspace.package] section)
    # This uses a more specific pattern to only match the version under [workspace.package]
    awk '/^\[workspace\.package\]/ {in_workspace=1} in_workspace && /^version = / {gsub(/"[^"]*"/, "\"{{version}}\""); in_workspace=0} {print}' Cargo.toml > Cargo.toml.tmp && mv Cargo.toml.tmp Cargo.toml

    # Update stately-derive dependency version in stately/Cargo.toml
    if [ -f "stately/Cargo.toml" ]; then
        # Update stately-derive version reference (handles both "X.Y.Z" and "*")
        sed -i '' "s/stately-derive = { path = \"..\/stately-derive\", version = \"[^\"]*\" }/stately-derive = { path = \"..\/stately-derive\", version = \"{{version}}\" }/" "stately/Cargo.toml" || true
    fi

    # Update stately version references in README files (if they exist)
    # Look for patterns like: stately = "0.1" or stately = "0.1.1" or stately = { version = "0.1", features = [...] }
    for readme in README.md stately/README.md; do
        if [ -f "$readme" ]; then
            # Update simple dependency format (handles both "X.Y" and "X.Y.Z")
            sed -i '' -E "s/stately = \"[0-9]+\.[0-9]+(\.[0-9]+)?\"/stately = \"{{version}}\"/" "$readme" || true
            # Update version field in dependency table format (handles both "X.Y" and "X.Y.Z")
            sed -i '' -E "s/stately = \\{ version = \"[0-9]+\.[0-9]+(\.[0-9]+)?\"/stately = { version = \"{{version}}\"/" "$readme" || true
        fi
    done

    # Update Cargo.lock
    cargo update --workspace

    # Generate full changelog
    echo "Generating changelog..."
    git cliff -o CHANGELOG.md

    # Generate release notes for this version
    echo "Generating release notes..."
    git cliff --unreleased --tag v{{version}} --strip header -o RELEASE_NOTES.md

    # Stage all changes
    git add Cargo.toml Cargo.lock CHANGELOG.md RELEASE_NOTES.md
    # Also add modified crate Cargo.toml and README files
    git add stately/Cargo.toml 2>/dev/null || true
    git add README.md stately/README.md 2>/dev/null || true

    # Commit
    git commit -m "chore: prepare release v{{version}}"

    # Push branch
    git push origin "release-v{{version}}"

    echo ""
    echo "✅ Release preparation complete!"
    echo ""
    echo "Release notes preview:"
    echo "----------------------"
    head -20 RELEASE_NOTES.md
    echo ""
    echo "Next steps:"
    echo "1. Create a PR from the 'release-v{{version}}' branch"
    echo "2. Review and merge the PR"
    echo "3. After merge, run: just tag-release {{version}}"
    echo ""

# Tag a release after the PR is merged
tag-release version:
    #!/usr/bin/env bash
    set -euo pipefail

    # Ensure we're on main and up to date
    git checkout main
    git pull origin main

    # Verify the version in Cargo.toml matches
    CARGO_VERSION=$(grep -E '^version = ' Cargo.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
    if [ "$CARGO_VERSION" != "{{version}}" ]; then
        echo "Error: Cargo.toml version ($CARGO_VERSION) does not match requested version ({{version}})"
        echo "Did the release PR merge successfully?"
        exit 1
    fi

    # Verify publish will work for stately-derive
    # Note: We can't dry-run stately because it depends on stately-derive which
    # hasn't been published yet. The actual publish will be handled by CI.
    cargo publish --dry-run -p stately-derive --no-verify

    # Create and push tag
    git tag -a "v{{version}}" -m "Release v{{version}}"
    git push origin "v{{version}}"

    echo ""
    echo "✅ Tag v{{version}} created and pushed!"
    echo "The release workflow will now run automatically."
    echo ""

# Preview what a release would do (dry run)
release-dry version:
    @echo "This would:"
    @echo "1. Create branch: release-v{{version}}"
    @echo "2. Update version to {{version}} in:"
    @echo "   - Cargo.toml (workspace.package section only)"
    @echo "   - README files (if they contain crate version references)"
    @echo "3. Update Cargo.lock (usually done automatically with Cargo.toml change)"
    @echo "4. Generate CHANGELOG.md"
    @echo "5. Generate RELEASE_NOTES.md"
    @echo "6. Create commit and push branch"
    @echo ""
    @echo "After PR merge, 'just tag-release {{version}}' would:"
    @echo "1. Tag the merged commit as v{{version}}"
    @echo "2. Push the tag (triggering release workflow)"
