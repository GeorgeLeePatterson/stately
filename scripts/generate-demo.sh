#!/usr/bin/env bash
set -euo pipefail

# Main script
OUTPUT_FILE="${1:-crates/stately/src/demo.rs}"

# Generate filtered macro expansion output for documentation
# Removes derive macro expansions, utoipa impl blocks, and serde internals

# =============================================================================
# Endpoint path definitions - utoipa::path annotations for each handler
# These match the definitions in crates/stately-derive/src/axum_api.rs
# Uses case statement for bash 3.x compatibility (no associative arrays)
# =============================================================================

print_path_annotation() {
    local indent="$1"
    local fn_name="$2"

    case "$fn_name" in
        create_entity)
            cat <<EOF
${indent}#[utoipa::path(
${indent}    put,
${indent}    path = "/",
${indent}    tag = "entity",
${indent}    request_body = Entity,
${indent}    responses(
${indent}        (status = 200, description = "Entity created successfully", body = OperationResponse),
${indent}        (status = 500, description = "Internal server error", body = crate::ApiError)
${indent}    )
${indent})]
EOF
            ;;
        list_all_entities)
            cat <<EOF
${indent}#[utoipa::path(
${indent}    get,
${indent}    path = "/list",
${indent}    tag = "entity",
${indent}    responses(
${indent}        (status = 200, description = "List all entities", body = ListResponse)
${indent}    )
${indent})]
EOF
            ;;
        list_entities)
            cat <<EOF
${indent}#[utoipa::path(
${indent}    get,
${indent}    path = "/list/{type}",
${indent}    tag = "entity",
${indent}    params(
${indent}        ("type" = StateEntry, Path, description = "Entity type to list")
${indent}    ),
${indent}    responses(
${indent}        (status = 200, description = "List entities by type", body = ListResponse)
${indent}    )
${indent})]
EOF
            ;;
        get_entities)
            cat <<EOF
${indent}#[utoipa::path(
${indent}    get,
${indent}    path = "/",
${indent}    tag = "entity",
${indent}    params(
${indent}        ("name" = Option<String>, Query, description = "Identifier of entity, ie id or name"),
${indent}        ("type" = Option<StateEntry>, Query, description = "Type of entity")
${indent}    ),
${indent}    responses(
${indent}        (status = 200, description = "Get entities with filters", body = EntitiesResponse)
${indent}    )
${indent})]
EOF
            ;;
        get_entity_by_id)
            cat <<EOF
${indent}#[utoipa::path(
${indent}    get,
${indent}    path = "/{id}",
${indent}    tag = "entity",
${indent}    params(
${indent}        ("id" = String, Path, description = "Entity ID"),
${indent}        GetEntityQuery
${indent}    ),
${indent}    responses(
${indent}        (status = 200, description = "Successfully retrieved entity", body = GetEntityResponse),
${indent}        (status = 404, description = "Entity not found", body = crate::ApiError)
${indent}    )
${indent})]
EOF
            ;;
        update_entity)
            cat <<EOF
${indent}#[utoipa::path(
${indent}    post,
${indent}    path = "/{id}",
${indent}    tag = "entity",
${indent}    params(
${indent}        ("id" = String, Path, description = "Entity ID")
${indent}    ),
${indent}    request_body = Entity,
${indent}    responses(
${indent}        (status = 200, description = "Entity updated successfully", body = OperationResponse),
${indent}        (status = 500, description = "Internal server error", body = crate::ApiError)
${indent}    )
${indent})]
EOF
            ;;
        patch_entity_by_id)
            cat <<EOF
${indent}#[utoipa::path(
${indent}    patch,
${indent}    path = "/{id}",
${indent}    tag = "entity",
${indent}    params(
${indent}        ("id" = String, Path, description = "Entity ID")
${indent}    ),
${indent}    request_body = Entity,
${indent}    responses(
${indent}        (status = 200, description = "Entity patched successfully", body = OperationResponse),
${indent}        (status = 500, description = "Internal server error", body = crate::ApiError)
${indent}    )
${indent})]
EOF
            ;;
        remove_entity)
            cat <<EOF
${indent}#[utoipa::path(
${indent}    delete,
${indent}    path = "/{entry}/{id}",
${indent}    tag = "entity",
${indent}    params(
${indent}        ("entry" = StateEntry, Path, description = "Entity type"),
${indent}        ("id" = String, Path, description = "Entity ID")
${indent}    ),
${indent}    responses(
${indent}        (status = 200, description = "Entity removed successfully", body = OperationResponse),
${indent}        (status = 404, description = "Entity not found", body = crate::ApiError),
${indent}        (status = 500, description = "Internal server error", body = crate::ApiError)
${indent}    )
${indent})]
EOF
            ;;
    esac
}

# Filter function - must be defined before use
process_expansion() {
write_mode="ON"
wrote_derive=0
must_use_mode=0
alloc_fmt_mode=0

while IFS= read -r line; do
    # Doc comments
    if [[ "$line" =~ ^//!.*$ ]]; then
        echo "$line"
        continue
    fi

    # Some lines to skip
    if [[ "$line" == *"#![feature(prelude_import)]"* ]] || \
        [[ "$line" == *"#[macro_use]"* ]] || \
        [[ "$line" == *"extern crate std;"* ]] || \
        [[ "$line" == *"#[prelude_import]"* ]] || \
        [[ "$line" == *"#![allow(clippy::needless_for_each)]"* ]] || \
        [[ "$line" == *"#![allow(unused_crate_dependencies)]"* ]] || \
        [[ "$line" == *"use std::prelude::rust_2024::*;"* ]]; then
        continue
    fi

    # Check for OFF triggers (only when currently ON)
    if [[ "$line" =~ ^impl.*utoipa:: ]] || \
        [[ "$line" == *"#[automatically_derived]"* ]] || \
        [[ "$line" == *"#[doc(hidden)]"* ]] || \
        [[ "$line" == *"fn main"* ]] || \
        [[ "$line" == *"#[allow(non_camel_case_types)]"* ]] || \
        [[ "$line" == *"use std::prelude::rust_2024::*;"* ]]; then
        write_mode="OFF"
        continue
    fi

    # Check for ON trigger (closing brace at start of line)
    if [[ "$write_mode" == "OFF" ]]; then
        if [[ "$line" =~ ^\}.*$ ]]; then
            write_mode="ON"
            continue
        fi
        # Skip this line since we're in OFF mode
        continue
    fi

    # Write if mode is ON

    # Extract indentation
    indent="${line%%[^ ]*}"

    # Add doc comments for key generated types
    if [[ "$line" == *"pub enum StateEntry"* ]]; then
        echo "${indent}/// Discriminator enum for entity types in the state."
        echo "${indent}///"
        echo "${indent}/// Used to specify which entity type you're querying when using type-erased operations."
    elif [[ "$line" == *"pub enum Entity"* ]]; then
        echo "${indent}/// Type-erased wrapper for all entity types."
        echo "${indent}///"
        echo "${indent}/// Allows storing and passing different entity types through a common interface."
    elif [[ "$line" == *"pub trait ForeignEntity"* ]]; then
        echo "${indent}/// Trait for implementing entities from external crates."
        echo "${indent}///"
        echo "${indent}/// This trait is generated in your crate to allow implementing it on foreign types"
        echo "${indent}/// without violating Rust's orphan rules. Use with \`#[collection(foreign)]\`."
    elif [[ "$line" == *"pub struct State"* ]] && [[ "$line" != *"pub struct StateEntry"* ]]; then
        echo "${indent}/// The main state struct with generated CRUD methods."
        echo "${indent}///"
        echo "${indent}/// Contains all entity collections and provides type-safe operations."
    elif [[ "$line" == *"pub struct ApiState"* ]]; then
        echo "${indent}/// The Axum API wrapper struct with generated handler methods."
        echo "${indent}///"
        echo "${indent}/// Provides REST API endpoints and event middleware for the state."
    elif [[ "$line" == *"pub enum ResponseEvent"* ]]; then
        echo "${indent}/// Events emitted after CRUD operations for event-driven persistence."
        echo "${indent}///"
        echo "${indent}/// Use with \`ApiState::event_middleware()\` to handle state changes."
    elif [[ "$line" == *"pub mod link_aliases"* ]]; then
        echo "${indent}/// Type aliases for \`Link<T>\` for each entity type."
        echo "${indent}///"
        echo "${indent}/// Provides convenient type names like \`PipelineLink\` instead of \`Link<Pipeline>\`."
    elif [[ "$line" =~ pub[[:space:]]+struct[[:space:]]+([A-Z][a-zA-Z0-9]+)Response ]]; then
        echo "${indent}/// Response type for API operations."
    elif [[ "$line" == *"pub struct EntitiesMap"* ]]; then
        echo "${indent}/// Map of all entity collections grouped by type."
    elif [[ "$line" =~ pub[[:space:]]+async[[:space:]]+fn[[:space:]]+([a-z_]+) ]]; then
        # Extract function name and print path annotation from lookup table
        fn_name="${BASH_REMATCH[1]}"
        print_path_annotation "$indent" "$fn_name"
    elif [[ "$line" =~ pub[[:space:]]+fn[[:space:]]+router ]]; then
        echo "${indent}/// Returns an Axum router with all API endpoints configured."
    elif [[ "$line" =~ pub[[:space:]]+fn[[:space:]]+event_middleware ]]; then
        echo "${indent}/// Middleware that emits events after CRUD operations for persistence integration."
    fi

    # Check if this is a struct or enum declaration - add derives first
    if [[ "$line" =~ ^\#\[serde\( ]] || \
        [[ "$line" =~ ^[[:space:]]*pub[[:space:]]+(struct|enum)[[:space:]]+([A-Z][a-zA-Z0-9]*) ]]; then
        if [[ $wrote_derive -eq 1 ]] && \
            [[ "$line" =~ ^[[:space:]]*pub[[:space:]]+(struct|enum)[[:space:]]+([A-Z][a-zA-Z0-9]*) ]]; then
            wrote_derive=0
        else

            if [[ "$line" == *"#[serde(rename_all = \"snake_case\")]"* ]]; then
                # Write derive attribute first
                echo "${indent}#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, utoipa::ToSchema)]"

            # Response types
            elif [[ "$line" =~ ^[[:space:]]*pub[[:space:]]+struct[[:space:]]+([A-Z][a-zA-Z0-9]*)Response.* ]]; then
                echo "${indent}#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, utoipa::ToSchema, utoipa::ToResponse)]"

            # EntitiesMap
            elif [[ "$line" == *"pub struct EntitiesMap"* ]]; then
                echo "${indent}#[derive(Debug, Clone, serde::Deserialize, utoipa::ToSchema)]"

            # State
            elif [[ "$line" == *"pub struct State"* ]]; then
                echo "${indent}#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]"

            # ApiState
            elif [[ "$line" == *"pub struct ApiState"* ]]; then
                echo "${indent}#[derive(Debug, Clone)]"

            # The rest
            else
                # Write derive attribute first
                echo "${indent}#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, utoipa::ToSchema)]"
            fi

            if [[ "$line" =~ ^\#\[serde\( ]]; then
                wrote_derive=1
            fi
        fi
    fi

    # Add OpenAPI
    if [[ "$line" =~ ^\#\[openapi\( ]]; then
        echo "${indent}#[derive(utoipa::OpenApi)]"
    fi

    # Replace ::stately:: with crate::
    line="${line//::stately::/crate::}"

    # Replace stately:: with crate::
    line="${line//stately::/crate::}"

    # Handle must_use pattern: remove ::alloc::__export::must_use({
    if [[ "$line" == *"::alloc::__export::must_use({"* ]]; then
        must_use_mode=1
        line="${line//::alloc::__export::must_use\({/}"
    fi

    # Check for closing }) when in must_use_mode and remove it
    if [[ $must_use_mode -eq 1 ]] && [[ "$line" =~ \}\) ]]; then
        must_use_mode=0
        line="${line//\}\)/}"
    fi

    # Handle alloc::fmt::format pattern: remove ::alloc::fmt::format(
    if [[ "$line" == *"::alloc::fmt::format("* ]]; then
        alloc_fmt_mode=1
        line="${line//::alloc::fmt::format\(/}"
    fi

    # In either mode, replace format_args! with format! and handle closing parens
    if [[ $must_use_mode -eq 1 ]] || [[ $alloc_fmt_mode -eq 1 ]]; then
        line="${line//format_args!/format!}"

        # Remove one trailing ) and any trailing comma from the format! line
        if [[ "$line" == *"format!"* ]]; then
            line="${line%)}"
            line="${line%,}"
            alloc_fmt_mode=0  # Turn off after processing the actual format line
        fi

        # Skip lines that are now just whitespace or closing parens
        if [[ "$line" =~ ^[[:space:]]*[\),]*[[:space:]]*$ ]]; then
            continue
        fi
    fi

    # Write the actual line
    echo "$line"
done
}

echo "Expanding macros from doc_expand example..."
echo "Filtering output..."

# Write header documentation
cat > "$OUTPUT_FILE" <<'EOF'
// ============================================================================
// DO NOT EDIT THIS FILE MANUALLY
// This file is auto-generated by scripts/generate-demo.sh
// Run `just docs` or `./scripts/generate-demo.sh` to regenerate
// ============================================================================

#![allow(clippy::all)]
#![allow(unused_imports)]
#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(unreachable_code)]
#![allow(unused_mut)]
#![expect(unused_crate_dependencies)]

//! Auto-generated code examples showing what the stately macros generate.
//!
//! This module demonstrates the actual code generated by the `#[stately::state]`
//! and `#[stately::axum_api]` macros. Refer to [`examples/doc_expand.rs`](https://github.com/georgeleepatterson/stately/blob/main/crates/stately/examples/doc_expand.rs)
//! for the source code that generates this output.
EOF

# Run cargo expand and pipe through the filter, append to file
cargo expand -p stately --example doc_expand --features axum 2>&1 | \
    grep -v "^warning:" | \
    grep -v "= help:" | \
    grep -v "= note:" | \
    grep -v "Checking" | \
    grep -v "Blocking" | \
    grep -v "Compiling" | \
    grep -v "Finished" | \
    process_expansion >> "$OUTPUT_FILE"

echo "✅ Generated filtered expansion: $OUTPUT_FILE"
echo "   $(wc -l < "$OUTPUT_FILE") lines"

# Format the generated file
echo "Formatting with rustfmt..."
cargo +nightly fmt -- "$OUTPUT_FILE"

echo "✅ Done!"
