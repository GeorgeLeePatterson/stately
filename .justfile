default:
    @just --list

# --- RUST TESTS ---

test-unit:
    cargo test --lib -F axum -- --nocapture --show-output

# Runs unit tests first then integration
test:
    cargo test -- --nocapture --show-output
    cargo test --all-features -- --nocapture --show-output

test-one test_name:
    cargo test "{{ test_name }}" -- --nocapture --show-output
    cargo test --all-features "{{ test_name }}" -- --nocapture --show-output

# --- COVERAGE ---

coverage:
    cargo llvm-cov --html \
     --ignore-filename-regex "(errors|examples|stately-derive).*" \
     --output-dir coverage -F axum --open

coverage-lcov:
    cargo llvm-cov --lcov \
     --ignore-filename-regex "(errors|examples|stately-derive).*" \
     --output-path coverage/lcov.info -F axum

# --- TYPESCRIPT ---

# Build TypeScript packages
ts-build:
    pnpm run build

# Run TypeScript tests
ts-test:
    pnpm run test

# Type check TypeScript packages
ts-typecheck:
    pnpm run typecheck

# Clean TypeScript build artifacts
ts-clean:
    pnpm run clean

# Install TypeScript dependencies
ts-install:
    pnpm install

ts-docs:
    pnpm run docs:api

# --- EXAMPLES ---

examples:
    cargo run -F axum --example "basic"
    cargo run -F axum --example "axum_api"

example example:
    cargo run -F axum --example "{{ example }}"

# --- DOCS ---

generate-demo:
    scripts/generate-demo.sh

docs:
    scripts/generate-demo.sh
    cargo doc -p stately --all-features --open

# --- MONOREPO ---

# Build everything (Rust + TypeScript)
build-all:
    cargo build --all-features
    pnpm run build

# Test everything (Rust + TypeScript)
test-all:
    cargo test --all-features
    pnpm run test

# Clean everything
clean-all:
    cargo clean
    pnpm run clean

# --- MAINTENANCE ---

# Run checks CI will
checks:
    cargo +nightly fmt -- --check
    cargo +stable clippy --all-features --all-targets -- -D warnings
    cargo +nightly clippy --all-features --all-targets
    just -f {{ justfile() }} test

# Check for outdated dependencies
check-outdated:
    cargo outdated

# Run security audit
audit:
    cargo audit

# Prepare a release (creates PR with version bumps and changelog)

# This updates all 4 Rust crates and all 5 npm packages to the same version
prepare-release version:
    #!/usr/bin/env bash
    set -euo pipefail

    # Validate version format
    if ! [[ "{{ version }}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Error: Version must be in format X.Y.Z (e.g., 0.2.0)"
        exit 1
    fi

    # Make sure required tools are installed
    git cliff --version || (echo "Error: git cliff is not installed" && exit 1)
    pnpm --version || (echo "Error: pnpm is not installed" && exit 1)

    # Get current version for release notes
    CURRENT_VERSION=$(grep -E '^version = ' Cargo.toml | head -1 | sed 's/version = "\(.*\)"/\1/')
    echo "Updating from $CURRENT_VERSION to {{ version }}"

    # Create release branch
    git checkout -b "release-v{{ version }}"

    # Generate demo documentation
    echo "Generating demo documentation..."
    ./scripts/generate-demo.sh

    # ===========================================
    # RUST CRATE UPDATES
    # ===========================================
    echo "Updating Rust crates..."

    # Update workspace version in root Cargo.toml (only in [workspace.package] section)
    awk '/^\[workspace\.package\]/ {in_workspace=1} in_workspace && /^version = / {gsub(/"[^"]*"/, "\"{{ version }}\""); in_workspace=0} {print}' Cargo.toml > Cargo.toml.tmp && mv Cargo.toml.tmp Cargo.toml

    # Update stately-derive dependency version in crates/stately/Cargo.toml
    if [ -f "crates/stately/Cargo.toml" ]; then
        sed -i '' "s/stately-derive = { path = \"..\/stately-derive\", version = \"[^\"]*\" }/stately-derive = { path = \"..\/stately-derive\", version = \"{{ version }}\" }/" "crates/stately/Cargo.toml" || true
    fi

    # Update stately dependency version in plugin crates (stately-files, stately-arrow)
    for plugin_crate in crates/stately-files/Cargo.toml crates/stately-arrow/Cargo.toml; do
        if [ -f "$plugin_crate" ]; then
            # Match patterns like: stately = { path = "../stately", ... }
            # Add version if not present, or update if present
            if grep -q 'stately = { path = "../stately"' "$plugin_crate"; then
                # Check if version is already present
                if grep -q 'stately = { path = "../stately", version = ' "$plugin_crate"; then
                    # Update existing version
                    sed -i '' -E 's/(stately = \{ path = "\.\.\/stately".*version = ")[^"]*(")/\1{{ version }}\2/' "$plugin_crate"
                else
                    # Add version to existing dependency
                    sed -i '' 's/stately = { path = "\.\.\/stately"/stately = { path = "..\/stately", version = "{{ version }}"/' "$plugin_crate"
                fi
            fi
        fi
    done

    # Update stately version references in README files
    for readme in README.md crates/stately/README.md crates/stately-arrow/README.md crates/stately-files/README.md; do
        if [ -f "$readme" ]; then
            # Update simple dependency format (handles both "X.Y" and "X.Y.Z")
            sed -i '' -E "s/stately = \"[0-9]+\.[0-9]+(\.[0-9]+)?\"/stately = \"{{ version }}\"/" "$readme" || true
            # Update version field in dependency table format
            sed -i '' -E "s/stately = \\{ version = \"[0-9]+\.[0-9]+(\.[0-9]+)?\"/stately = { version = \"{{ version }}\"/" "$readme" || true
            # Update stately-arrow references
            sed -i '' -E "s/stately-arrow = \"[0-9]+\.[0-9]+(\.[0-9]+)?\"/stately-arrow = \"{{ version }}\"/" "$readme" || true
            sed -i '' -E "s/stately-arrow = \\{ version = \"[0-9]+\.[0-9]+(\.[0-9]+)?\"/stately-arrow = { version = \"{{ version }}\"/" "$readme" || true
            # Update stately-files references
            sed -i '' -E "s/stately-files = \"[0-9]+\.[0-9]+(\.[0-9]+)?\"/stately-files = \"{{ version }}\"/" "$readme" || true
            sed -i '' -E "s/stately-files = \\{ version = \"[0-9]+\.[0-9]+(\.[0-9]+)?\"/stately-files = { version = \"{{ version }}\"/" "$readme" || true
        fi
    done

    # Update Cargo.lock
    cargo update --workspace

    # ===========================================
    # NPM PACKAGE UPDATES
    # ===========================================
    echo "Updating npm packages..."

    # Update version in all package.json files
    for pkg in packages/*/package.json; do
        if [ -f "$pkg" ]; then
            # Use node/jq to update version field
            tmp=$(mktemp)
            jq --arg v "{{ version }}" '.version = $v' "$pkg" > "$tmp" && mv "$tmp" "$pkg"
            echo "  Updated $pkg"
        fi
    done

    # Update root package.json version (monorepo marker)
    if [ -f "package.json" ]; then
        tmp=$(mktemp)
        jq --arg v "{{ version }}" '.version = $v' "package.json" > "$tmp" && mv "$tmp" "package.json"
        echo "  Updated package.json"
    fi

    # Regenerate pnpm-lock.yaml to reflect version changes
    pnpm install --lockfile-only

    # ===========================================
    # CHANGELOG & RELEASE NOTES
    # ===========================================
    echo "Generating changelog..."
    git cliff --tag v{{ version }} -o CHANGELOG.md

    echo "Generating release notes..."
    git cliff --unreleased --tag v{{ version }} --strip header -o RELEASE_NOTES.md

    # ===========================================
    # STAGE & COMMIT
    # ===========================================
    # Stage all Rust changes
    git add Cargo.toml Cargo.lock CHANGELOG.md RELEASE_NOTES.md
    git add crates/*/Cargo.toml 2>/dev/null || true
    git add README.md crates/*/README.md 2>/dev/null || true
    git add crates/stately/src/demo.rs 2>/dev/null || true

    # Stage all npm changes
    git add package.json pnpm-lock.yaml 2>/dev/null || true
    git add packages/*/package.json 2>/dev/null || true

    # Commit
    git commit -m "chore: prepare release v{{ version }}"

    # Push branch
    git push origin "release-v{{ version }}"

    echo ""
    echo "✅ Release preparation complete!"
    echo ""
    echo "Updated versions to {{ version }} in:"
    echo "  Rust crates:"
    echo "    - stately"
    echo "    - stately-derive"
    echo "    - stately-files"
    echo "    - stately-arrow"
    echo "  npm packages:"
    echo "    - @statelyjs/schema"
    echo "    - @statelyjs/ui"
    echo "    - @statelyjs/stately"
    echo "    - @statelyjs/arrow"
    echo "    - @statelyjs/files"
    echo ""
    echo "Release notes preview:"
    echo "----------------------"
    head -20 RELEASE_NOTES.md
    echo ""
    echo "Next steps:"
    echo "1. Create a PR from the 'release-v{{ version }}' branch"
    echo "2. Review and merge the PR"
    echo "3. After merge, run: just tag-release {{ version }}"
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
    if [ "$CARGO_VERSION" != "{{ version }}" ]; then
        echo "Error: Cargo.toml version ($CARGO_VERSION) does not match requested version ({{ version }})"
        echo "Did the release PR merge successfully?"
        exit 1
    fi

    # Verify npm package versions match
    for pkg in packages/*/package.json; do
        PKG_VERSION=$(jq -r '.version' "$pkg")
        PKG_NAME=$(jq -r '.name' "$pkg")
        if [ "$PKG_VERSION" != "{{ version }}" ]; then
            echo "Error: $PKG_NAME version ($PKG_VERSION) does not match requested version ({{ version }})"
            exit 1
        fi
    done

    echo "All versions verified as {{ version }}"

    # Verify publish will work for stately-derive (the first crate in the chain)
    # Note: We can only dry-run stately-derive because other crates depend on
    # previously published crates. The actual publish will be handled by CI.
    echo "Dry-run publishing stately-derive..."
    cargo publish --dry-run -p stately-derive --no-verify

    # Create and push tag
    git tag -a "v{{ version }}" -m "Release v{{ version }}"
    git push origin "v{{ version }}"

    echo ""
    echo "✅ Tag v{{ version }} created and pushed!"
    echo ""
    echo "The release workflow will now:"
    echo "  1. Publish Rust crates to crates.io:"
    echo "     stately-derive → stately → stately-files → stately-arrow"
    echo "  2. Publish npm packages to npm:"
    echo "     @statelyjs/schema → @statelyjs/ui → @statelyjs/stately → @statelyjs/arrow, @statelyjs/files"
    echo "  3. Create GitHub Release with release notes"
    echo ""

# Preview what a release would do (dry run)
release-dry version:
    @echo "This would:"
    @echo "1. Create branch: release-v{{ version }}"
    @echo "2. Update version to {{ version }} in:"
    @echo "   Rust crates:"
    @echo "     - Cargo.toml (workspace.package)"
    @echo "     - crates/stately/Cargo.toml (stately-derive dep)"
    @echo "     - crates/stately-files/Cargo.toml (stately dep)"
    @echo "     - crates/stately-arrow/Cargo.toml (stately dep)"
    @echo "   npm packages:"
    @echo "     - packages/schema/package.json"
    @echo "     - packages/ui/package.json"
    @echo "     - packages/stately/package.json"
    @echo "     - packages/arrow/package.json"
    @echo "     - packages/files/package.json"
    @echo "     - package.json (root)"
    @echo "   README files with version references"
    @echo "3. Update Cargo.lock and pnpm-lock.yaml"
    @echo "4. Generate CHANGELOG.md"
    @echo "5. Generate RELEASE_NOTES.md"
    @echo "6. Create commit and push branch"
    @echo ""
    @echo "After PR merge, 'just tag-release {{ version }}' would:"
    @echo "1. Verify all versions match {{ version }}"
    @echo "2. Dry-run publish stately-derive"
    @echo "3. Tag the merged commit as v{{ version }}"
    @echo "4. Push the tag (triggering release workflow)"
    @echo ""
    @echo "The release workflow publishes:"
    @echo "  Rust: stately-derive → stately → stately-files → stately-arrow"
    @echo "  npm:  @statelyjs/schema → ui → stately → arrow, files"
