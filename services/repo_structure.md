# SMEPro Lite Repository Structure Frontend

This document contains a Mermaid diagram that illustrates the file and component structure of the SMEPro Lite application.

```mermaid
graph TD
    subgraph Legend
        direction LR
        L_Dir[/"Directory"/]
        L_File[["File"]]
        L_Schema{{"Schema/Config"}}
        L_Service{{"Service/API"}}
        L_Component(("Component"))
    end

    A[SMEPro-Lite] --> B_public[/"public"/]
    B_public --> B_schemas[/"schemas"/]
    B_schemas --> C_business_cat{business_categories.json}
    B_schemas --> C_solo_cat{solo_categories.json}
    B_schemas --> C_vault_cat{vault_categories.json}

    A --> D_src[/"src"/]
    D_src --> E_components[/"components"/]
    D_src --> F_services[/"services"/]
    D_src --> G_types("types.ts")
    D_src --> H_constants("constants.ts")
    D_src --> I_App("App.tsx")
    D_src --> J_index("index.tsx")
    
    A --> K_index_html[["index.html"]]
    A --> L_package_json{{"package.json"}}
    A --> M_readme[["README.md"]]
    A --> N_metadata{{"metadata.json"}}
    A --> O_reqs[["requirements.txt"]]
    
    K_index_html --> J_index
    J_index --> I_App

    I_App --> E_components
    I_App --> F_services
    
    subgraph "Main Views & Layout"
        Comp_App(("App.tsx"))
        Comp_ChatWindow(("ChatWindow.tsx"))
        Comp_Dashboard(("Dashboard.tsx"))
        Comp_Header(("Header.tsx"))
        Comp_Sidebar(("Sidebar.tsx"))
        Comp_SmeSelector(("SmeSelector.tsx"))
        Comp_UserIdentity(("UserIdentity.tsx"))
        Comp_Vault(("Vault.tsx"))
    end

    subgraph "Marketing Pages"
        Comp_HomePage(("HomePage.tsx"))
        Comp_FeaturesPage(("FeaturesPage.tsx"))
        Comp_HowItWorksPage(("HowItWorksPage.tsx"))
        Comp_PlansPage(("PlansPage.tsx"))
        Comp_LandingPage(("LandingPage.tsx"))
        Comp_SafeAiPage(("SafeAiPage.tsx"))
    end
    
    subgraph "Modals"
        Comp_AddSmeModal(("AddSmeModal.tsx"))
        Comp_ChangeSmeModal(("ChangeSmeModal.tsx"))
        Comp_CitationsModal(("CitationsModal.tsx"))
        Comp_EditProfileModal(("EditProfileModal.tsx"))
        Comp_HarmfulContentWarningModal(("HarmfulContentWarningModal.tsx"))
        Comp_LockoutWarningModal(("LockoutWarningModal.tsx"))
        Comp_ManageCategoriesModal(("ManageCategoriesModal.tsx"))
        Comp_PaymentModal(("PaymentModal.tsx"))
        Comp_SafeAiModal(("SafeAiModal.tsx"))
        Comp_SaveToVaultModal(("SaveToVaultModal.tsx"))
        Comp_SearchResultsModal(("SearchResultsModal.tsx"))
        Comp_ShareSessionModal(("ShareSessionModal.tsx"))
        Comp_SmeProBuilderModal(("SmeProBuilderModal.tsx"))
    end
    
    subgraph "Interactive Chat Elements"
        Comp_ActionTypeResponse(("ActionTypeResponse.tsx"))
        Comp_ContextPopover(("ContextPopover.tsx"))
        Comp_GuidedSession(("GuidedSession.tsx"))
        Comp_InteractiveResponse(("InteractiveResponse.tsx"))
        Comp_SmeSuggestion(("SmeSuggestion.tsx"))
        Comp_SuggestedPrompts(("SuggestedPrompts.tsx"))
    end
    
    subgraph "Other Components"
        Comp_AiSafetySettings(("AiSafetySettings.tsx"))
        Comp_ContextSearch(("ContextSearch.tsx"))
    end
    
    E_components --> "Main Views & Layout"
    E_components --> "Marketing Pages"
    E_components --> "Modals"
    E_components --> "Interactive Chat Elements"
    E_components --> "Other Components"

    subgraph "Services"
        S_backend{backend.ts}
        S_collab{collaboration_service.ts}
        S_api_sync{api_sync_service.ts}
        S_openai_api{openai_api.ts}
        S_grok_api{grok_api.ts}
        S_aws_api{aws_api.ts}
        S_gemini_api{gemini_api.ts}
        S_repo_structure[["repo_structure.md"]]
    end
    F_services --> "Services"

    ext_Gemini((@google/genai))
    
    Comp_App -- Manages --> Comp_ChatWindow
    Comp_App -- Manages --> Comp_Vault
    Comp_App -- Manages --> Comp_Dashboard
    Comp_App -- Manages --> Comp_Sidebar
    Comp_App -- Manages Pages --> "Marketing Pages"
    Comp_App -- Manages Modals --> "Modals"
    
    Comp_ChatWindow -- Contains --> "Interactive Chat Elements"
    Comp_ChatWindow -- Contains --> Comp_ContextSearch
    Comp_ChatWindow -- Uses --> S_collab
    Comp_ChatWindow -- Uses --> S_backend
    Comp_ChatWindow -- Calls --> ext_Gemini

    Comp_ContextPopover -- Calls --> ext_Gemini

    Comp_Vault -- Contains --> Comp_SmeProBuilderModal
    Comp_Vault -- Uses --> S_backend
    Comp_Vault -- Calls --> ext_Gemini
    
    Comp_Dashboard -- Contains --> Comp_AiSafetySettings
    Comp_Dashboard -- Uses --> S_backend

    Comp_EditProfileModal -- Uses --> S_api_sync
    S_api_sync -- Uses --> S_openai_api
    S_api_sync -- Uses --> S_grok_api
    S_api_sync -- Uses --> S_aws_api
    S_api_sync -- Uses --> S_gemini_api
    S_api_sync -- Calls --> ext_Gemini
    
    style A fill:#0f172a,stroke:#38bdf8,stroke-width:2px
    style B_public fill:#1e293b,stroke:#94a3b8
    style D_src fill:#1e293b,stroke:#94a3b8
```