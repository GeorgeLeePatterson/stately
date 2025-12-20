//! Argument parsing for the axum_api macro

use syn::parse::{Parse, ParseStream};
use syn::{Ident, Token, parenthesized};

use super::openapi::OpenApiArgs;

/// Parsed arguments for the `#[stately::axum_api(...)]` macro.
///
/// Supports the following formats:
/// - `#[stately::axum_api(StateName)]`
/// - `#[stately::axum_api(StateName, openapi)]`
/// - `#[stately::axum_api(StateName, openapi(components = [Type1, Type2]))]`
pub struct AxumApiArgs {
    /// The state type name (required, always first)
    pub state_type: Ident,
    /// OpenAPI configuration (None if disabled)
    pub openapi:    Option<OpenApiArgs>,
}

impl AxumApiArgs {
    /// Returns true if OpenAPI generation is enabled.
    pub fn enable_openapi(&self) -> bool { self.openapi.is_some() }

    /// Returns the additional OpenAPI component types, or an empty slice if none.
    pub fn components(&self) -> &[syn::Type] {
        self.openapi.as_ref().map(|o| o.components.as_slice()).unwrap_or(&[])
    }
}

impl Parse for AxumApiArgs {
    fn parse(input: ParseStream) -> syn::Result<Self> {
        // Parse the required state type name
        let state_type: Ident = input.parse()?;

        let mut openapi = None;

        // Parse optional comma-separated arguments
        while input.peek(Token![,]) {
            input.parse::<Token![,]>()?;

            // Handle trailing comma
            if input.is_empty() {
                break;
            }

            let ident: Ident = input.parse()?;
            let ident_str = ident.to_string();

            match ident_str.as_str() {
                "openapi" => {
                    // Check for optional config: openapi(...)
                    let config = if input.peek(syn::token::Paren) {
                        let content;
                        parenthesized!(content in input);
                        content.parse::<OpenApiArgs>()?
                    } else {
                        OpenApiArgs::empty()
                    };

                    openapi = Some(config);
                }
                _ => {
                    return Err(syn::Error::new_spanned(
                        &ident,
                        format!(
                            "unknown argument `{}`. Expected `openapi` or `openapi(...)`",
                            ident
                        ),
                    ));
                }
            }
        }

        Ok(AxumApiArgs { state_type, openapi })
    }
}
