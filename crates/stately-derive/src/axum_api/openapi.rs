//! OpenAPI argument parsing for the axum_api macro
//!
//! Handles parsing of `openapi(...)` configuration within `#[stately::axum_api(...)]`.

use syn::parse::{Parse, ParseStream};
use syn::punctuated::Punctuated;
use syn::{Ident, Token, Type, bracketed};

/// Parsed arguments for the `openapi(...)` section of the axum_api macro.
///
/// Supports the following formats:
/// - `openapi` (no parentheses, just enables OpenAPI)
/// - `openapi()` (empty parentheses, same as above)
/// - `openapi(components = [Type1, Type2])`
#[derive(Default)]
pub struct OpenApiArgs {
    /// Additional component types to include in OpenAPI schema
    pub components: Vec<Type>,
}

impl OpenApiArgs {
    /// Creates an empty OpenAPI configuration (enabled but no extra options).
    pub fn empty() -> Self { Self::default() }
}

impl Parse for OpenApiArgs {
    fn parse(input: ParseStream) -> syn::Result<Self> {
        let mut components = Vec::new();

        while !input.is_empty() {
            let ident: Ident = input.parse()?;
            let ident_str = ident.to_string();

            match ident_str.as_str() {
                "components" => {
                    components = parse_components(input, ident.span())?;
                }
                _ => {
                    return Err(syn::Error::new_spanned(
                        &ident,
                        format!(
                            "unknown openapi option `{}`. Expected `components = [...]`",
                            ident
                        ),
                    ));
                }
            }

            // Handle comma between openapi options
            if input.peek(Token![,]) {
                input.parse::<Token![,]>()?;
            }
        }

        Ok(OpenApiArgs { components })
    }
}

/// Parses `= [Type1, Type2, ...]` after the `components` keyword.
///
/// # Arguments
/// * `input` - The parse stream positioned after `components`
/// * `components_span` - The span of the `components` keyword for error reporting
fn parse_components(
    input: ParseStream,
    components_span: proc_macro2::Span,
) -> syn::Result<Vec<Type>> {
    // Expect `=`
    if !input.peek(Token![=]) {
        return Err(syn::Error::new(components_span, "expected `=` after `components`"));
    }
    input.parse::<Token![=]>()?;

    // Expect `[...]`
    if !input.peek(syn::token::Bracket) {
        return Err(syn::Error::new(input.span(), "expected `[...]` after `components =`"));
    }

    let content;
    bracketed!(content in input);

    let types: Punctuated<Type, Token![,]> = content.parse_terminated(Type::parse, Token![,])?;

    Ok(types.into_iter().collect())
}
