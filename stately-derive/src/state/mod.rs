//! Implementation of the `#[stately::state]` attribute macro

use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Fields};

mod api;

/// Parsed configuration from the #[stately::state(...)] attribute
#[derive(Default)]
pub struct StateConfig {
    /// API frameworks to generate code for (e.g., ["axum", "actix"])
    pub apis: Vec<String>,
}

impl StateConfig {
    /// Parse the attribute arguments
    pub fn parse(attr: TokenStream) -> Self {
        let mut config = StateConfig::default();
        let attr_str = attr.to_string();

        // Parse api = ["axum", "actix"] or api = ["axum"]
        if let Some(start) = attr_str.find("api")
            && let Some(eq_pos) = attr_str[start..].find('=')
        {
            let after_eq = &attr_str[start + eq_pos + 1..].trim();

            // Handle array syntax: ["axum", "actix"]
            if let Some(arr_start) = after_eq.find('[') {
                if let Some(arr_end) = after_eq.find(']') {
                    let array_content = &after_eq[arr_start + 1..arr_end];
                    for item in array_content.split(',') {
                        let trimmed = item.trim().trim_matches('"').trim();
                        if !trimmed.is_empty() {
                            config.apis.push(trimmed.to_string());
                        }
                    }
                }
            }
            // Handle single value: "axum"
            else if let Some(value) = extract_string_literal(after_eq) {
                config.apis.push(value);
            }
        }

        config
    }
}

/// Generates application state with entity collections.
pub fn state(attr: TokenStream, item: TokenStream) -> TokenStream {
    let config = StateConfig::parse(attr);
    let input = syn::parse_macro_input!(item as DeriveInput);

    let vis = &input.vis;
    let name = &input.ident;

    // Parse the struct fields
    let fields = match &input.data {
        Data::Struct(data) => match &data.fields {
            Fields::Named(fields) => &fields.named,
            _ => {
                return syn::Error::new_spanned(
                    &input,
                    "State can only be derived for structs with named fields",
                )
                .to_compile_error()
                .into();
            }
        },
        _ => {
            return syn::Error::new_spanned(&input, "State can only be derived for structs")
                .to_compile_error()
                .into();
        }
    };

    // Separate singletons from collections
    let mut singletons = Vec::new();
    let mut collections = Vec::new();

    for field in fields {
        let field_name = field.ident.as_ref().unwrap();
        let field_type = &field.ty;

        // Check if this field has #[singleton] attribute
        let is_singleton = field.attrs.iter().any(|attr| attr.path().is_ident("singleton"));

        if is_singleton {
            singletons.push((field_name, field_type));
        } else {
            collections.push((field_name, field_type));
        }
    }

    // Extract type identifiers for enum variants
    let singleton_variants: Vec<_> =
        singletons.iter().map(|(_, ty)| extract_type_ident(ty)).collect();

    let collection_variants: Vec<_> =
        collections.iter().map(|(_, ty)| extract_type_ident(ty)).collect();

    // Collect everything into vectors for reuse in the quote! macro
    let all_variants: Vec<_> =
        singleton_variants.iter().chain(&collection_variants).cloned().collect();
    let all_types: Vec<_> = singletons
        .iter()
        .map(|(_, ty)| *ty)
        .chain(collections.iter().map(|(_, ty)| *ty))
        .collect();

    let singleton_fields: Vec<_> = singletons.iter().map(|(name, _)| *name).collect();
    let singleton_types: Vec<_> = singletons.iter().map(|(_, ty)| *ty).collect();

    let collection_fields: Vec<_> = collections.iter().map(|(name, _)| *name).collect();
    let collection_types: Vec<_> = collections.iter().map(|(_, ty)| *ty).collect();

    // Generate the core state code
    let core_code = quote! {
        // Generate StateEntry enum
        #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, ::serde::Serialize, ::serde::Deserialize)]
        #[cfg_attr(feature = "openapi", derive(::utoipa::ToSchema))]
        #[serde(rename_all = "snake_case")]
        #vis enum StateEntry {
            #( #all_variants, )*
        }

        impl StateEntry {
            #vis fn as_ref(&self) -> &str {
                match self {
                    #( Self::#all_variants => <#all_types as ::stately::StateEntity>::STATE_ENTRY, )*
                }
            }
        }

        impl ::std::str::FromStr for StateEntry {
            type Err = String;

            fn from_str(s: &str) -> ::std::result::Result<Self, Self::Err> {
                match s {
                    #( <#all_types as ::stately::StateEntity>::STATE_ENTRY => Ok(Self::#all_variants), )*
                    _ => Err(format!("Unknown entity type: {}", s)),
                }
            }
        }

        // Generate Entity enum
        #[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::serde::Deserialize)]
        #[cfg_attr(feature = "openapi", derive(::utoipa::ToSchema))]
        #[serde(tag = "type", content = "data", rename_all = "snake_case")]
        #vis enum Entity {
            #( #all_variants(#all_types), )*
        }

        // Generate the State struct
        #vis struct #name {
            #( #vis #singleton_fields: ::stately::Singleton<#singleton_types>, )*
            #( #vis #collection_fields: ::stately::Collection<#collection_types>, )*
        }

        impl Default for #name {
            fn default() -> Self {
                Self::new()
            }
        }

        impl #name {
            /// Creates a new empty state
            #vis fn new() -> Self {
                Self {
                    #( #singleton_fields: ::stately::Singleton::new(Default::default()), )*
                    #( #collection_fields: ::stately::Collection::new(), )*
                }
            }

            /// Gets an entity by ID and type
            #vis fn get_entity(&self, id: &str, entry: StateEntry) -> Option<(::stately::EntityIdentifier, Entity)> {
                use ::stately::StateCollection;
                match entry {
                    #(
                        StateEntry::#singleton_variants => {
                            self.#singleton_fields.get_entity(id).map(|(id, e)| (*id, Entity::#singleton_variants(e.clone())))
                        }
                    )*
                    #(
                        StateEntry::#collection_variants => {
                            self.#collection_fields.get_entity(id).map(|(id, e)| (*id, Entity::#collection_variants(e.clone())))
                        }
                    )*
                }
            }

            /// Lists all entities of a specific type
            #vis fn list_entities(&self, entry: Option<StateEntry>) -> ::hashbrown::HashMap<StateEntry, Vec<::stately::Summary>> {
                use ::stately::StateCollection;
                let mut result = ::hashbrown::HashMap::default();

                #(
                    if entry.is_none() || entry == Some(StateEntry::#singleton_variants) {
                        result.insert(StateEntry::#singleton_variants, self.#singleton_fields.list());
                    }
                )*
                #(
                    if entry.is_none() || entry == Some(StateEntry::#collection_variants) {
                        result.insert(StateEntry::#collection_variants, self.#collection_fields.list());
                    }
                )*

                result
            }

            /// Searches entities across all collections
            #vis fn search_entities(&self, needle: &str) -> ::hashbrown::HashMap<StateEntry, ::hashbrown::HashMap<::stately::EntityIdentifier, Entity>> {
                use ::stately::StateCollection;
                let mut result = ::hashbrown::HashMap::default();

                #(
                    {
                        let matches = self.#singleton_fields.search_entities(needle);
                        if !matches.is_empty() {
                            let mut entities = ::hashbrown::HashMap::default();
                            for (id, entity) in matches {
                                entities.insert(*id, Entity::#singleton_variants(entity.clone()));
                            }
                            result.insert(StateEntry::#singleton_variants, entities);
                        }
                    }
                )*
                #(
                    {
                        let matches = self.#collection_fields.search_entities(needle);
                        if !matches.is_empty() {
                            let mut entities = ::hashbrown::HashMap::default();
                            for (id, entity) in matches {
                                entities.insert(*id, Entity::#collection_variants(entity.clone()));
                            }
                            result.insert(StateEntry::#collection_variants, entities);
                        }
                    }
                )*

                result
            }
        }

        // Generate StatelyState trait implementation for axum feature
        #[cfg(feature = "axum")]
        impl ::stately::StatelyState for #name {
            type StateEntry = StateEntry;
            type Entity = Entity;

            fn get_entity(&self, id: &str, entry: Self::StateEntry) -> Option<(::stately::EntityIdentifier, Self::Entity)> {
                self.get_entity(id, entry)
            }

            fn list_entities(&self, entry: Option<Self::StateEntry>) -> ::hashbrown::HashMap<Self::StateEntry, Vec<::stately::Summary>> {
                self.list_entities(entry)
            }

            fn search_entities(&self, needle: &str) -> ::hashbrown::HashMap<Self::StateEntry, ::hashbrown::HashMap<::stately::EntityIdentifier, Self::Entity>> {
                self.search_entities(needle)
            }
        }
    };

    // Generate API-specific code if requested
    let api_code = if !config.apis.is_empty() {
        api::generate(&config, name, vis)
    } else {
        quote! {}
    };

    let expanded = quote! {
        #core_code
        #api_code
    };

    TokenStream::from(expanded)
}

/// Extracts the type identifier from a type
fn extract_type_ident(ty: &syn::Type) -> syn::Ident {
    match ty {
        syn::Type::Path(type_path) => {
            // Get the last segment of the path
            type_path.path.segments.last().unwrap().ident.clone()
        }
        _ => panic!("Unsupported type for state field"),
    }
}

/// Extracts a string literal from attribute syntax
fn extract_string_literal(s: &str) -> Option<String> {
    let trimmed = s.trim().trim_matches('"');
    if trimmed.is_empty() { None } else { Some(trimmed.to_string()) }
}
