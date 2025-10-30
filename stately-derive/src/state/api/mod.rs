//! API code generation for different web frameworks

use proc_macro2::TokenStream;
use quote::quote;

mod axum;

use super::StateConfig;

/// Generate API-specific code based on the configuration
pub fn generate(
    config: &StateConfig,
    state_name: &syn::Ident,
    vis: &syn::Visibility,
) -> TokenStream {
    let mut api_modules = Vec::new();

    for api_type in &config.apis {
        let module_code = match api_type.as_str() {
            "axum" => axum::generate(state_name, vis),
            other => {
                // For unsupported API types, generate a compile error
                let error_msg =
                    format!("Unsupported API type: '{}'. Currently supported: 'axum'", other);
                quote! {
                    compile_error!(#error_msg);
                }
            }
        };

        // Namespace each API under its own module
        let module_name =
            syn::Ident::new(&format!("{}_api", api_type), proc_macro2::Span::call_site());

        api_modules.push(quote! {
            #vis mod #module_name {
                use super::*;
                #module_code
            }
        });
    }

    quote! {
        #( #api_modules )*
    }
}
