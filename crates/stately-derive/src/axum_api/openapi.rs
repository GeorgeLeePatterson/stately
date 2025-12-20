//! OpenAPI argument parsing for the axum_api macro
//!
//! Handles parsing of `openapi(...)` configuration within `#[stately::axum_api(...)]`.

use syn::parse::{Parse, ParseStream};
use syn::punctuated::Punctuated;
use syn::{Ident, LitStr, Path, Token, Type, bracketed};

/// Parsed arguments for the `openapi(...)` section of the axum_api macro.
///
/// Supports the following formats:
/// - `openapi` (no parentheses, just enables OpenAPI)
/// - `openapi()` (empty parentheses, same as above)
/// - `openapi(components = [Type1, Type2])`
/// - `openapi(server = "/api/v1/entity")`
/// - `openapi(paths = [custom_handler1, custom_handler2])`
/// - `openapi(server = "/api/v1/entity", components = [...], paths = [...])`
#[derive(Default)]
pub struct OpenApiArgs {
    /// Additional component types to include in OpenAPI schema
    pub components: Vec<Type>,
    /// Server URL prefix for all paths (generates `servers(...)` attribute)
    pub server:     Option<String>,
    /// Additional path handlers to include in OpenAPI docs
    pub paths:      Vec<Path>,
}

impl OpenApiArgs {
    /// Creates an empty OpenAPI configuration (enabled but no extra options).
    pub fn empty() -> Self { Self::default() }
}

impl Parse for OpenApiArgs {
    fn parse(input: ParseStream) -> syn::Result<Self> {
        let mut components = Vec::new();
        let mut server = None;
        let mut paths = Vec::new();

        while !input.is_empty() {
            let ident: Ident = input.parse()?;
            let ident_str = ident.to_string();

            match ident_str.as_str() {
                "components" => {
                    components = parse_components(input, ident.span())?;
                }
                "server" => {
                    server = Some(parse_string_value(input, ident.span(), "server")?);
                }
                "paths" => {
                    paths = parse_path_list(input, ident.span())?;
                }
                _ => {
                    return Err(syn::Error::new_spanned(
                        &ident,
                        format!(
                            "unknown openapi option `{}`. Expected `components`, `server`, or \
                             `paths`",
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

        Ok(OpenApiArgs { components, server, paths })
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

/// Parses `= "string"` after a keyword.
///
/// # Arguments
/// * `input` - The parse stream positioned after the keyword
/// * `keyword_span` - The span of the keyword for error reporting
/// * `keyword` - The keyword name for error messages
fn parse_string_value(
    input: ParseStream,
    keyword_span: proc_macro2::Span,
    keyword: &str,
) -> syn::Result<String> {
    // Expect `=`
    if !input.peek(Token![=]) {
        return Err(syn::Error::new(keyword_span, format!("expected `=` after `{keyword}`")));
    }
    input.parse::<Token![=]>()?;

    // Expect a string literal
    let lit: LitStr = input.parse().map_err(|_| {
        syn::Error::new(input.span(), format!("expected string literal after `{keyword} =`"))
    })?;

    Ok(lit.value())
}

/// Parses `= [path1, path2, ...]` after the `paths` keyword.
///
/// # Arguments
/// * `input` - The parse stream positioned after `paths`
/// * `paths_span` - The span of the `paths` keyword for error reporting
fn parse_path_list(input: ParseStream, paths_span: proc_macro2::Span) -> syn::Result<Vec<Path>> {
    // Expect `=`
    if !input.peek(Token![=]) {
        return Err(syn::Error::new(paths_span, "expected `=` after `paths`"));
    }
    input.parse::<Token![=]>()?;

    // Expect `[...]`
    if !input.peek(syn::token::Bracket) {
        return Err(syn::Error::new(input.span(), "expected `[...]` after `paths =`"));
    }

    let content;
    bracketed!(content in input);

    let paths: Punctuated<Path, Token![,]> = content.parse_terminated(Path::parse, Token![,])?;

    Ok(paths.into_iter().collect())
}
