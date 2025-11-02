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

    // Structure to hold parsed field information from the user's struct
    struct FieldInfo<'a> {
        name:             &'a syn::Ident,
        entity_type:      &'a syn::Type,
        is_singleton:     bool,
        custom_type:      Option<syn::Type>,
        variant_override: Option<syn::Ident>,
    }

    // Structure to hold all codegen-related information for a field
    // This keeps all derived information explicitly associated with the field
    #[derive(Clone)]
    struct FieldCodegen {
        // Original field info
        field_name:             syn::Ident,
        original_entity_type:   syn::Type,
        is_singleton:           bool,
        custom_collection_type: Option<syn::Type>,

        // Derived info
        variant_name:       syn::Ident,
        actual_entity_type: syn::Ident, // Either original type or wrapper name
        needs_wrapper:      bool,
        snake_case_entry:   syn::LitStr,

        // For deduplication tracking
        type_signature: String,
    }

    impl FieldCodegen {
        /// Get the collection type to use in the State struct field
        fn collection_type_tokens(&self) -> proc_macro2::TokenStream {
            if let Some(custom) = &self.custom_collection_type {
                if self.needs_wrapper {
                    // Custom type with wrapper - use Collection<WrapperType>
                    let wrapper = &self.actual_entity_type;
                    quote! { ::stately::Collection<#wrapper> }
                } else {
                    // Custom type without wrapper - use the custom type as-is
                    quote! { #custom }
                }
            } else if self.is_singleton {
                // Singleton
                let ty = &self.actual_entity_type;
                quote! { ::stately::Singleton<#ty> }
            } else {
                // Regular collection
                let ty = &self.actual_entity_type;
                quote! { ::stately::Collection<#ty> }
            }
        }

        /// Returns true if this is the first occurrence of this entity type
        fn is_first_occurrence(&self, all_fields: &[FieldCodegen]) -> bool {
            all_fields
                .iter()
                .find(|f| f.type_signature == self.type_signature)
                .map(|f| f.field_name == self.field_name)
                .unwrap_or(true)
        }
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

    // ========================================================================
    // NEW APPROACH: Build FieldCodegen structs with explicit associations
    // ========================================================================

    // First pass: Track type occurrences to detect duplicates
    let mut type_occurrences: HashMap<String, Vec<usize>> = HashMap::new();

    for (idx, (info, _)) in field_variants.iter().enumerate() {
        let entity_type = info.entity_type;
        let type_str = quote::quote!(#entity_type).to_string();
        type_occurrences.entry(type_str).or_default().push(idx);
    }

    // Second pass: Build FieldCodegen for each field with all derived info
    let field_codegens: Vec<FieldCodegen> = field_variants
        .iter()
        .enumerate()
        .map(|(idx, (info, variant))| {
            let entity_type = info.entity_type;
            let type_signature = quote::quote!(#entity_type).to_string();

            // Determine if this field needs a wrapper
            let occurrences = type_occurrences.get(&type_signature).unwrap();
            let is_first_occurrence = occurrences[0] == idx;
            let needs_wrapper = occurrences.len() > 1 && !is_first_occurrence;

            // Actual entity type is either the wrapper name or the original type
            let actual_entity_type =
                if needs_wrapper { variant.clone() } else { extract_type_ident(info.entity_type) };

            // Generate snake_case entry from the VARIANT name (not the original type)
            // This ensures unique snake_case strings even when the same type is reused
            let variant_str = variant.to_string();
            let snake = to_snake_case(&variant_str);
            let snake_case_entry = syn::LitStr::new(&snake, variant.span());

            FieldCodegen {
                field_name: info.name.clone(),
                original_entity_type: info.entity_type.clone(),
                is_singleton: info.is_singleton,
                custom_collection_type: info.custom_type.clone(),
                variant_name: variant.clone(),
                actual_entity_type,
                needs_wrapper,
                snake_case_entry,
                type_signature,
            }
        })
        .collect();

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

    // ========================================================================
    // NEW: Generate wrapper types using FieldCodegen
    // ========================================================================
    let wrapper_derives = if enable_openapi {
        quote! {
            #[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::serde::Deserialize, ::utoipa::ToSchema)]
        }
    } else {
        quote! {
            #[derive(Debug, Clone, PartialEq, ::serde::Serialize, ::serde::Deserialize)]
        }
    };

    let wrapper_defs: Vec<_> = field_codegens
        .iter()
        .filter(|f| f.needs_wrapper)
        .map(|field| {
            let wrapper_name = &field.variant_name;
            let inner_ty = &field.original_entity_type;

            quote! {
                /// Wrapper type for disambiguating multiple uses of the same entity type
                #wrapper_derives
                #[serde(transparent)]
                #vis struct #wrapper_name(#vis #inner_ty);

                impl #wrapper_name {
                    /// Creates a new wrapper instance
                    #vis fn new(inner: #inner_ty) -> Self {
                        Self(inner)
                    }

                    /// Consumes the wrapper and returns the inner value
                    #vis fn into_inner(self) -> #inner_ty {
                        self.0
                    }

                    /// Returns a reference to the inner value
                    #vis fn inner(&self) -> &#inner_ty {
                        &self.0
                    }

                    /// Returns a mutable reference to the inner value
                    #vis fn inner_mut(&mut self) -> &mut #inner_ty {
                        &mut self.0
                    }
                }

                impl ::core::ops::Deref for #wrapper_name {
                    type Target = #inner_ty;
                    fn deref(&self) -> &Self::Target {
                        &self.0
                    }
                }

                impl ::core::ops::DerefMut for #wrapper_name {
                    fn deref_mut(&mut self) -> &mut Self::Target {
                        &mut self.0
                    }
                }

                impl ::core::convert::AsRef<#inner_ty> for #wrapper_name {
                    fn as_ref(&self) -> &#inner_ty {
                        &self.0
                    }
                }

                impl ::core::convert::AsMut<#inner_ty> for #wrapper_name {
                    fn as_mut(&mut self) -> &mut #inner_ty {
                        &mut self.0
                    }
                }

                impl ::core::convert::From<#inner_ty> for #wrapper_name {
                    fn from(inner: #inner_ty) -> Self {
                        Self(inner)
                    }
                }

                impl ::core::convert::From<#wrapper_name> for #inner_ty {
                    fn from(wrapper: #wrapper_name) -> Self {
                        wrapper.0
                    }
                }

                impl ::stately::HasName for #wrapper_name {
                    fn name(&self) -> &str {
                        self.0.name()
                    }
                }

                impl ::stately::StateEntity for #wrapper_name {
                    type Entry = StateEntry;
                    const STATE_ENTRY: StateEntry = StateEntry::#wrapper_name;

                    fn description(&self) -> Option<&str> {
                        self.0.description()
                    }

                    fn summary(&self, id: ::stately::EntityId) -> ::stately::Summary {
                        self.0.summary(id)
                    }
                }
            }
        })
        .collect();

    // ========================================================================
    // NEW: Pre-compute all data from FieldCodegen for use in quote! macros
    // ========================================================================

    // For State struct fields
    let field_names: Vec<_> = field_codegens.iter().map(|f| &f.field_name).collect();
    let field_types: Vec<_> = field_codegens.iter().map(|f| f.collection_type_tokens()).collect();

    // For Entity enum and StateEntry
    let all_variants: Vec<_> = field_codegens.iter().map(|f| &f.variant_name).collect();
    let all_entity_types: Vec<_> = field_codegens.iter().map(|f| &f.actual_entity_type).collect();
    let snake_case_entries: Vec<_> = field_codegens.iter().map(|f| &f.snake_case_entry).collect();

    // For StateEntity impls (only first occurrence of each type, non-wrappers)
    let impl_fields: Vec<_> = field_codegens
        .iter()
        .filter(|f| !f.needs_wrapper && f.is_first_occurrence(&field_codegens))
        .collect();
    let impl_types: Vec<_> = impl_fields.iter().map(|f| &f.actual_entity_type).collect();
    let impl_variants: Vec<_> = impl_fields.iter().map(|f| &f.variant_name).collect();

    // For categorized iteration (singletons, collections, customs)
    let singleton_codegens: Vec<_> = field_codegens.iter().filter(|f| f.is_singleton).collect();
    let collection_codegens: Vec<_> = field_codegens
        .iter()
        .filter(|f| !f.is_singleton && f.custom_collection_type.is_none())
        .collect();
    let custom_codegens: Vec<_> = field_codegens
        .iter()
        .filter(|f| !f.is_singleton && f.custom_collection_type.is_some())
        .collect();

    // Extract field names and variants for categorized groups
    let singleton_fields: Vec<_> = singleton_codegens.iter().map(|f| &f.field_name).collect();
    let singleton_variants: Vec<_> = singleton_codegens.iter().map(|f| &f.variant_name).collect();
    let collection_fields: Vec<_> = collection_codegens.iter().map(|f| &f.field_name).collect();
    let collection_variants: Vec<_> = collection_codegens.iter().map(|f| &f.variant_name).collect();
    let custom_fields: Vec<_> = custom_codegens.iter().map(|f| &f.field_name).collect();
    let custom_variants: Vec<_> = custom_codegens.iter().map(|f| &f.variant_name).collect();

    // For link_aliases deduplication
    let collection_types: Vec<_> =
        collection_codegens.iter().map(|f| &f.actual_entity_type).collect();
    let custom_entity_types: Vec<_> =
        custom_codegens.iter().map(|f| &f.actual_entity_type).collect();

    // Generate the core state code
    let core_code = quote! {
        // Generate wrapper types for duplicate entity types
        #( #wrapper_defs )*

        // Generate StateEntry enum
        #state_entry_derives
        #[serde(rename_all = "snake_case")]
        #vis enum StateEntry {
            #( #all_variants, )*
        }

        impl StateEntry {
            #vis fn as_ref(&self) -> &str {
                match self {
                    #( Self::#all_variants => #snake_case_entries, )*
                }
            }
        }

        impl ::core::convert::AsRef<str> for StateEntry {
            fn as_ref(&self) -> &str {
                self.as_ref()
            }
        }

        impl ::std::str::FromStr for StateEntry {
            type Err = String;

            fn from_str(s: &str) -> ::std::result::Result<Self, Self::Err> {
                match s {
                    #( #snake_case_entries => Ok(Self::#all_variants), )*
                    _ => Err(format!("Unknown entity type: {}", s)),
                }
            }
        }

        // Generate Entity enum
        #entity_derives
        #[serde(tag = "type", content = "data", rename_all = "snake_case")]
        #vis enum Entity {
            #( #all_variants(#all_entity_types), )*
        }

        impl From<&Entity> for StateEntry {
            fn from(entity: &Entity) -> Self {
                match entity {
                    #( Entity::#all_variants(_) => StateEntry::#all_variants, )*
                }
            }
        }

        // Generate StateEntity implementations for original types (wrappers generate their own)
        #(
            impl ::stately::StateEntity for #impl_types {
                type Entry = StateEntry;
                const STATE_ENTRY: StateEntry = StateEntry::#impl_variants;
            }
        )*

        // Generate the State struct
        #(#attrs)*
        #vis struct #name {
            #( #vis #field_names: #field_types, )*
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
            #vis fn remove_entity(&mut self, id: &str, entry: StateEntry) -> ::stately::Result<()> {
                use ::stately::StateCollection;
                match entry {
                    #(
                        StateEntry::#singleton_variants => self.#singleton_fields.remove(id).map(|_| ()),
                    )*
                    #(
                        StateEntry::#collection_variants => self.#collection_fields.remove(id).map(|_| ()),
                    )*
                    #(
                        StateEntry::#custom_variants => self.#custom_fields.remove(id).map(|_| ()),
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
    let all_entity_types: Vec<_> =
        collection_types.iter().chain(custom_entity_types.iter()).collect();

    // Deduplicate entity types by their string representation
    let mut seen_types = std::collections::HashSet::new();
    let mut unique_entity_types = Vec::new();
    let mut link_alias_names = Vec::new();

    for ty in all_entity_types {
        // ty is already an Ident (wrapper name or original type name)
        let type_name_str = ty.to_string();

        if seen_types.insert(type_name_str) {
            unique_entity_types.push(ty);
            link_alias_names.push(syn::Ident::new(&format!("{}Link", ty), ty.span()));
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

/// Converts PascalCase to snake_case
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
