//! Implementation of the `#[stately::entity]` attribute macro

use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Fields};

/// Implements the `HasName` trait for a struct, optionally with helpers.
///
/// This macro does NOT implement `StateEntity` - that is done by the `#[stately::state]` macro.
/// This separation ensures that entity identity (`STATE_ENTRY`) is defined in a single place.
///
/// # Attributes
///
/// - `#[stately::entity]` - Uses the default "name" field
/// - `#[stately::entity(name_field = "field_name")]` - Uses a different field for the name
/// - `#[stately::entity(name_method = "method_name")]` - Calls a method to get the name
/// - `#[stately::entity(description_field = "field_name")]` - Uses a specific field for description
/// - `#[stately::entity(description = "text")]` - Uses a static description
///
/// # Examples
///
/// ```ignore
/// #[stately::entity]
/// struct Pipeline {
///     name: String,
/// }
///
/// #[stately::entity(name_field = "identifier")]
/// struct Config {
///     identifier: String,
/// }
///
/// #[stately::entity(name_method = "get_name")]
/// struct Task {
///     id: String,
/// }
/// impl Task {
///     fn get_name(&self) -> &str { &self.id }
/// }
/// ```
pub fn entity(attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(item as DeriveInput);

    let name = &input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();

    // Parse attributes from the attribute arguments
    let mut name_field: Option<syn::Ident> = None;
    let mut name_method: Option<syn::Ident> = None;

    // Parse the attribute token stream manually
    let attr_str = attr.to_string();

    // Parse name_field
    if let Some(start) = attr_str.find("name_field")
        && let Some(eq_pos) = attr_str[start..].find('=')
    {
        let after_eq = &attr_str[start + eq_pos + 1..];
        if let Some(value) = extract_string_literal(after_eq) {
            name_field = Some(syn::Ident::new(&value, proc_macro2::Span::call_site()));
        }
    }

    // Parse name_method
    if let Some(start) = attr_str.find("name_method")
        && let Some(eq_pos) = attr_str[start..].find('=')
    {
        let after_eq = &attr_str[start + eq_pos + 1..];
        if let Some(value) = extract_string_literal(after_eq) {
            name_method = Some(syn::Ident::new(&value, proc_macro2::Span::call_site()));
        }
    }

    // Check for conflicting name specifications
    if name_field.is_some() && name_method.is_some() {
        return syn::Error::new_spanned(&input, "Cannot specify both name_field and name_method")
            .to_compile_error()
            .into();
    }

    // Validate that the struct has named fields
    let fields = match &input.data {
        Data::Struct(data) => match &data.fields {
            Fields::Named(fields) => &fields.named,
            _ => {
                return syn::Error::new_spanned(
                    &input,
                    "stately::entity can only be used on structs with named fields",
                )
                .to_compile_error()
                .into();
            }
        },
        _ => {
            return syn::Error::new_spanned(&input, "stately::entity can only be used on structs")
                .to_compile_error()
                .into();
        }
    };

    // Determine how to implement name()
    let name_impl = if let Some(method) = name_method {
        // Call the specified method
        quote! {
            fn name(&self) -> &str {
                self.#method()
            }
        }
    } else {
        // Use field access (default to "name" field if not specified)
        let field =
            name_field.unwrap_or_else(|| syn::Ident::new("name", proc_macro2::Span::call_site()));

        // Check that the field exists
        let has_field = fields.iter().any(|f| f.ident.as_ref() == Some(&field));
        if !has_field {
            return syn::Error::new_spanned(
                &input,
                format!(
                    "Struct must have a '{}' field, or use #[stately::entity(name_field = \
                     \"field_name\")] or #[stately::entity(name_method = \"method_name\")]",
                    field
                ),
            )
            .to_compile_error()
            .into();
        }

        quote! {
            fn name(&self) -> &str {
                &self.#field
            }
        }
    };

    let expanded = quote! {
        #input

        impl #impl_generics ::stately::HasName for #name #ty_generics #where_clause {
            #name_impl
        }
    };

    TokenStream::from(expanded)
}

/// Extracts a string literal from attribute syntax
fn extract_string_literal(s: &str) -> Option<String> {
    let end = s.trim().strip_prefix('"')?;
    Some(end.to_string())
}
