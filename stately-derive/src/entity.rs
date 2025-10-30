//! Implementation of the `#[stately::entity]` attribute macro

use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Fields};

/// Derives the `StateEntity` trait for a struct.
///
/// # Attributes
///
/// - `#[stately(singleton)]` - Marks this as a singleton entity
/// - `#[stately(name_field = "field_name")]` - Uses a different field for the name (default:
///   "name")
/// - `#[stately(description_field = "field_name")]` - Uses a specific field for description
/// - `#[stately(description = "text")]` - Uses a static description
pub fn entity(attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(item as DeriveInput);

    let name = &input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();

    // Parse attributes from the attribute arguments
    let mut is_singleton = false;
    let mut name_field = syn::Ident::new("name", proc_macro2::Span::call_site());
    let mut description_field: Option<syn::Ident> = None;
    let mut static_description: Option<String> = None;

    // Parse the attribute token stream manually
    let attr_str = attr.to_string();
    if attr_str.contains("singleton") {
        is_singleton = true;
    }

    // Simple parsing for name_field and description
    if let Some(start) = attr_str.find("name_field")
        && let Some(eq_pos) = attr_str[start..].find('=')
    {
        let after_eq = &attr_str[start + eq_pos + 1..];
        if let Some(value) = extract_string_literal(after_eq) {
            name_field = syn::Ident::new(&value, proc_macro2::Span::call_site());
        }
    }

    if let Some(start) = attr_str.find("description_field")
        && let Some(eq_pos) = attr_str[start..].find('=')
    {
        let after_eq = &attr_str[start + eq_pos + 1..];
        if let Some(value) = extract_string_literal(after_eq) {
            description_field = Some(syn::Ident::new(&value, proc_macro2::Span::call_site()));
        }
    }

    if let Some(start) = attr_str.find("description")
        && !attr_str[start..].starts_with("description_field")
        && let Some(eq_pos) = attr_str[start..].find('=')
    {
        let after_eq = &attr_str[start + eq_pos + 1..];
        if let Some(value) = extract_string_literal(after_eq) {
            static_description = Some(value);
        }
    }

    // Validate that the struct has the required fields
    let fields = match &input.data {
        Data::Struct(data) => match &data.fields {
            Fields::Named(fields) => &fields.named,
            _ => {
                return syn::Error::new_spanned(
                    &input,
                    "StateEntity can only be derived for structs with named fields",
                )
                .to_compile_error()
                .into();
            }
        },
        _ => {
            return syn::Error::new_spanned(&input, "StateEntity can only be derived for structs")
                .to_compile_error()
                .into();
        }
    };

    // Check that the name field exists (unless singleton)
    if !is_singleton {
        let has_name_field = fields.iter().any(|f| f.ident.as_ref() == Some(&name_field));
        if !has_name_field {
            return syn::Error::new_spanned(
                &input,
                format!("Struct must have a '{}' field of type String", name_field),
            )
            .to_compile_error()
            .into();
        }
    }

    // Generate STATE_ENTRY value - convert CamelCase to snake_case
    let state_entry = to_snake_case(&name.to_string());

    // Generate name() implementation
    let name_impl = if is_singleton {
        quote! {
            fn name(&self) -> &str {
                #state_entry
            }
        }
    } else {
        quote! {
            fn name(&self) -> &str {
                &self.#name_field
            }
        }
    };

    // Generate description() implementation
    let description_impl = if let Some(desc) = static_description {
        quote! {
            fn description(&self) -> Option<&str> {
                Some(#desc)
            }
        }
    } else if let Some(field) = description_field {
        quote! {
            fn description(&self) -> Option<&str> {
                self.#field.as_deref()
            }
        }
    } else {
        quote! {}
    };

    let expanded = quote! {
        #input

        impl #impl_generics ::stately::StateEntity for #name #ty_generics #where_clause {
            const STATE_ENTRY: &'static str = #state_entry;

            #name_impl

            #description_impl
        }
    };

    TokenStream::from(expanded)
}

/// Extracts a string literal from attribute syntax
fn extract_string_literal(s: &str) -> Option<String> {
    let end = s.trim().strip_prefix('"')?;
    Some(end.to_string())
}

/// Converts CamelCase to snake_case
fn to_snake_case(s: &str) -> String {
    let mut result = String::new();
    let mut prev_is_lower = false;

    for c in s.chars() {
        if c.is_uppercase() {
            if prev_is_lower {
                result.push('_');
            }
            result.push(c.to_lowercase().next().unwrap());
            prev_is_lower = false;
        } else {
            result.push(c);
            prev_is_lower = c.is_lowercase();
        }
    }

    result
}
