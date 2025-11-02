//! Implementation of the `#[stately::state]` attribute macro

use std::collections::HashMap;

use proc_macro::TokenStream;
use quote::quote;
use syn::parse::{Parse, ParseStream};
use syn::{Data, DeriveInput, Fields, Token};

/// Parsing structure for #[collection(...)] attribute arguments
struct CollectionArgs {
    custom_type: Option<syn::Type>,
    variant:     Option<syn::Ident>,
}

impl Parse for CollectionArgs {
    fn parse(input: ParseStream) -> syn::Result<Self> {
        let mut custom_type = None;
        let mut variant = None;

        // Parse optional custom type (appears first if present)
        if input.peek(syn::Ident) || input.peek(syn::token::PathSep) {
            // Look ahead to check if this is a type or a keyword
            let fork = input.fork();
            if fork.parse::<syn::Ident>().is_ok() && !input.peek2(Token![=]) {
                custom_type = Some(input.parse()?);

                // Optional comma after type
                if input.peek(Token![,]) {
                    input.parse::<Token![,]>()?;
                }
            }
        }

        // Parse variant = "Name" if present
        while !input.is_empty() {
            let key: syn::Ident = input.parse()?;

            if key == "variant" {
                input.parse::<Token![=]>()?;
                let lit: syn::LitStr = input.parse()?;
                variant = Some(syn::Ident::new(&lit.value(), lit.span()));
            } else {
                return Err(input.error(format!("Unknown attribute argument: {}", key)));
            }

            // Optional trailing comma
            if input.peek(Token![,]) {
                input.parse::<Token![,]>()?;
            }
        }

        Ok(CollectionArgs { custom_type, variant })
    }
}

/// Generates application state with entity collections.
pub fn state(attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(item as DeriveInput);

    // Parse optional 'openapi' parameter
    let enable_openapi = if !attr.is_empty() {
        let attr_str = attr.to_string();
        attr_str.trim() == "openapi"
    } else {
        false
    };

    let vis = &input.vis;
    let name = &input.ident;
    let attrs = &input.attrs;

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

    // Structure to hold field information
    struct FieldInfo<'a> {
        name:             &'a syn::Ident,
        entity_type:      &'a syn::Type,
        is_singleton:     bool,
        custom_type:      Option<syn::Type>,
        variant_override: Option<syn::Ident>,
    }

    // Parse all fields and their attributes
    let mut field_infos = Vec::new();

    for field in fields {
        let field_name = field.ident.as_ref().unwrap();
        let field_type = &field.ty;

        let mut is_singleton = false;
        let mut custom_type = None;
        let mut variant_override = None;

        // Parse attributes
        for attr in &field.attrs {
            if attr.path().is_ident("singleton") {
                is_singleton = true;
            } else if attr.path().is_ident("collection") {
                // Parse #[collection] or #[collection(...)]
                let args = if attr.meta.require_path_only().is_ok() {
                    // Bare #[collection] with no args
                    CollectionArgs { custom_type: None, variant: None }
                } else {
                    // #[collection(...)] - parse the args
                    match attr.parse_args::<CollectionArgs>() {
                        Ok(args) => args,
                        Err(e) => return e.to_compile_error().into(),
                    }
                };

                custom_type = args.custom_type;
                variant_override = args.variant;
            }
        }

        field_infos.push(FieldInfo {
            name: field_name,
            entity_type: field_type,
            is_singleton,
            custom_type,
            variant_override,
        });
    }

    // Separate singletons from collections
    let mut singletons = Vec::new();
    let mut collections = Vec::new();
    let mut custom_collections = Vec::new();

    for info in &field_infos {
        if info.is_singleton {
            singletons.push((info.name, info.entity_type));
        } else if let Some(ref custom) = info.custom_type {
            custom_collections.push((info.name, info.entity_type, custom));
        } else {
            collections.push((info.name, info.entity_type));
        }
    }

    // Build variant names with collision detection
    let mut variant_map: HashMap<String, &syn::Ident> = HashMap::new();
    let mut field_variants = Vec::new();

    for info in &field_infos {
        let variant = if let Some(ref override_name) = info.variant_override {
            override_name.clone()
        } else {
            extract_type_ident(info.entity_type)
        };

        // Check for collisions
        let variant_str = variant.to_string();
        if let Some(existing_field) = variant_map.insert(variant_str.clone(), info.name) {
            let entity_type = info.entity_type;
            return syn::Error::new(
                info.name.span(),
                format!(
                    "Duplicate variant '{}' from entity type '{}' used in fields '{}' and '{}'. \
                     Use #[collection(variant = \"UniqueName\")] on one of the fields to \
                     disambiguate.",
                    variant,
                    quote::quote!(#entity_type),
                    existing_field,
                    info.name
                ),
            )
            .to_compile_error()
            .into();
        }

        field_variants.push((info, variant));
    }

    // Extract variants by category
    let singleton_variants: Vec<_> = field_variants
        .iter()
        .filter(|(info, _)| info.is_singleton)
        .map(|(_, variant)| variant.clone())
        .collect();

    let collection_variants: Vec<_> = field_variants
        .iter()
        .filter(|(info, _)| !info.is_singleton && info.custom_type.is_none())
        .map(|(_, variant)| variant.clone())
        .collect();

    let custom_variants: Vec<_> = field_variants
        .iter()
        .filter(|(info, _)| !info.is_singleton && info.custom_type.is_some())
        .map(|(_, variant)| variant.clone())
        .collect();

    // Collect everything into vectors for reuse in the quote! macro
    let all_variants: Vec<_> = singleton_variants
        .iter()
        .chain(&collection_variants)
        .chain(&custom_variants)
        .cloned()
        .collect();
    let all_types: Vec<_> = singletons
        .iter()
        .map(|(_, ty)| *ty)
        .chain(collections.iter().map(|(_, ty)| *ty))
        .chain(custom_collections.iter().map(|(_, ty, _)| *ty))
        .collect();

    let singleton_fields: Vec<_> = singletons.iter().map(|(name, _)| *name).collect();
    let singleton_types: Vec<_> = singletons.iter().map(|(_, ty)| *ty).collect();

    let collection_fields: Vec<_> = collections.iter().map(|(name, _)| *name).collect();
    let collection_types: Vec<_> = collections.iter().map(|(_, ty)| *ty).collect();

    let custom_fields: Vec<_> = custom_collections.iter().map(|(name, _, _)| *name).collect();
    let custom_coll_types: Vec<_> =
        custom_collections.iter().map(|(_, _, coll_ty)| *coll_ty).collect();

    // Conditionally add ToSchema derive based on openapi parameter
    let state_entry_derives = if enable_openapi {
        quote! {
            #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, ::serde::Serialize, ::serde::Deserialize, ::utoipa::ToSchema)]
        }
    } else {
        quote! {
            #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, ::serde::Serialize, ::serde::Deserialize)]
        }
    };

    let entity_derives = if enable_openapi {
        quote! {
            #[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::serde::Deserialize, ::utoipa::ToSchema)]
        }
    } else {
        quote! {
            #[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::serde::Deserialize)]
        }
    };

    // Generate the core state code
    let core_code = quote! {
        // Generate StateEntry enum
        #state_entry_derives
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
        #entity_derives
        #[serde(tag = "type", content = "data", rename_all = "snake_case")]
        #vis enum Entity {
            #( #all_variants(#all_types), )*
        }

        impl From<&Entity> for StateEntry {
            fn from(entity: &Entity) -> Self {
                match entity {
                    #( Entity::#all_variants(_) => StateEntry::#all_variants, )*
                }
            }
        }

        // Generate the State struct
        #(#attrs)*
        #vis struct #name {
            #( #vis #singleton_fields: ::stately::Singleton<#singleton_types>, )*
            #( #vis #collection_fields: ::stately::Collection<#collection_types>, )*
            #( #vis #custom_fields: #custom_coll_types, )*
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
                    #( #custom_fields: Default::default(), )*
                }
            }

            /// Creates a new entity
            #vis fn create_entity(&mut self, entity: Entity) -> ::stately::EntityId {
                use ::stately::StateCollection;
                match entity {
                    #(
                        Entity::#singleton_variants(inner) => self.#singleton_fields.create(inner),
                    )*
                    #(
                        Entity::#collection_variants(inner) => self.#collection_fields.create(inner),
                    )*
                    #(
                        Entity::#custom_variants(inner) => self.#custom_fields.create(inner),
                    )*
                }
            }

            /// Updates an existing entity by ID
            #vis fn update_entity(&mut self, id: &str, entity: Entity) -> ::stately::Result<()> {
                use ::stately::StateCollection;

                match entity {
                    #(
                        Entity::#singleton_variants(inner) => {
                            self.#singleton_fields.update(id, inner)?;
                        }
                    )*
                    #(
                        Entity::#collection_variants(inner) => {
                            self.#collection_fields.update(id, inner)?;
                        }
                    )*
                    #(
                        Entity::#custom_variants(inner) => {
                            self.#custom_fields.update(id, inner)?;
                        }
                    )*
                }
                Ok(())
            }

            /// Removes an entity by ID and type
            #vis fn remove_entity(&mut self, id: &str, entry: StateEntry) -> bool {
                use ::stately::StateCollection;
                match entry {
                    #(
                        StateEntry::#singleton_variants => self.#singleton_fields.remove(id).is_ok(),
                    )*
                    #(
                        StateEntry::#collection_variants => self.#collection_fields.remove(id).is_ok(),
                    )*
                    #(
                        StateEntry::#custom_variants => self.#custom_fields.remove(id).is_ok(),
                    )*
                }
            }

            /// Gets an entity by ID and type
            #vis fn get_entity(&self, id: &str, entry: StateEntry) -> Option<(::stately::EntityId, Entity)> {
                use ::stately::StateCollection;
                match entry {
                    #(
                        StateEntry::#singleton_variants => {
                            self.#singleton_fields.get_entity(id).map(|(id, e)| (id.clone(), Entity::#singleton_variants(e.clone())))
                        }
                    )*
                    #(
                        StateEntry::#collection_variants => {
                            self.#collection_fields.get_entity(id).map(|(id, e)| (id.clone(), Entity::#collection_variants(e.clone())))
                        }
                    )*
                    #(
                        StateEntry::#custom_variants => {
                            self.#custom_fields.get_entity(id).map(|(id, e)| (id.clone(), Entity::#custom_variants(e.clone())))
                        }
                    )*
                }
            }

            /// Lists all entities of a specific type
            #vis fn list_entities(&self, entry: Option<StateEntry>) -> ::stately::hashbrown::HashMap<StateEntry, Vec<::stately::Summary>> {
                use ::stately::StateCollection;
                let mut result = ::stately::hashbrown::HashMap::default();

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
                #(
                    if entry.is_none() || entry == Some(StateEntry::#custom_variants) {
                        result.insert(StateEntry::#custom_variants, self.#custom_fields.list());
                    }
                )*

                result
            }

            /// Searches entities across all collections
            #vis fn search_entities(
                &self,
                needle: &str
            ) -> ::stately::hashbrown::HashMap<
                StateEntry,
                ::stately::hashbrown::HashMap<::stately::EntityId, Entity>
            > {
                use ::stately::StateCollection;
                let mut result = ::stately::hashbrown::HashMap::default();

                #(
                    {
                        let matches = self.#singleton_fields.search_entities(needle);
                        if !matches.is_empty() {
                            let mut entities = ::stately::hashbrown::HashMap::default();
                            for (id, entity) in matches {
                                entities.insert(id.clone(), Entity::#singleton_variants(entity.clone()));
                            }
                            result.insert(StateEntry::#singleton_variants, entities);
                        }
                    }
                )*
                #(
                    {
                        let matches = self.#collection_fields.search_entities(needle);
                        if !matches.is_empty() {
                            let mut entities = ::stately::hashbrown::HashMap::default();
                            for (id, entity) in matches {
                                entities.insert(id.clone(), Entity::#collection_variants(entity.clone()));
                            }
                            result.insert(StateEntry::#collection_variants, entities);
                        }
                    }
                )*
                #(
                    {
                        let matches = self.#custom_fields.search_entities(needle);
                        if !matches.is_empty() {
                            let mut entities = ::stately::hashbrown::HashMap::default();
                            for (id, entity) in matches {
                                entities.insert(id.clone(), Entity::#custom_variants(entity.clone()));
                            }
                            result.insert(StateEntry::#custom_variants, entities);
                        }
                    }
                )*

                result
            }

            #vis fn is_empty(&self) -> bool {
                #(
                    self.#collection_fields.is_empty() &&
                )*
                #(
                    self.#custom_fields.is_empty() &&
                )* true
            }
        }
    };

    // Generate link_aliases module with type aliases for Link<T> for all entity types
    let all_entity_types: Vec<_> = collection_types
        .iter()
        .chain(custom_collections.iter().map(|(_, entity_ty, _)| entity_ty))
        .collect();

    // Deduplicate entity types by their string representation
    let mut seen_types = std::collections::HashSet::new();
    let mut unique_entity_types = Vec::new();
    let mut link_alias_names = Vec::new();

    for ty in all_entity_types {
        let type_name = extract_type_ident(ty);
        let type_name_str = type_name.to_string();

        if seen_types.insert(type_name_str) {
            unique_entity_types.push(ty);
            link_alias_names.push(syn::Ident::new(&format!("{}Link", type_name), type_name.span()));
        }
    }

    let link_aliases = quote! {
        /// Type aliases for `Link<T>` for all entity types in this state
        #vis mod link_aliases {
            use super::*;

            #(
                #vis type #link_alias_names = ::stately::Link<#unique_entity_types>;
            )*
        }
    };

    let expanded = quote! {
        #core_code
        #link_aliases
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
