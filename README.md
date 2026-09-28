# 🌍 dhimapp Multilayer-Interactive-Map

# 🔗 Digital Humanities Visualization Framework

## ⭐ Introduction

This web-application is a specialized **Digital Humanities (DH) framework** for visualizing geospatial data through a multilayered interactive map. It is designed to display historical datasets across different spatial and temporal dimensions.

The system combines exploratory research and science communication in a "data blind" system:

- **Research Functionalities:** Researcher can interact with the data through dynamic filtering, text search, timeline adjustments, and an integrated data table, allowing for exploratory data analysis.
- **Science Communication:** User can expearience guided tours through specific historical narratives. Researcher can highlighting curated data points alongside contextual information.
- **Data Blindness:** The engine acts as a generic, content-agnostic "data blind" pipeline that reads declarative configuration files to understand how to filter, process, and display raw GeoJSON data. This separation of concerns allows DH researchers to swap out entire datasets and completely change the narrative of the application without the need to rewrite the core logic.

## 🌐 Live Demo

**[View the live application here](https://historic-interactive-map.vercel.app/)**

---

**Tech Stack:**
The application is built for performance up to 10,000 data points. In this range the timeline animation will run at 60 FPS and the filters will apply instantly. For up to 50,000 data points the map will still render, but the timeline animation might stutter and the search might take too long.
The application uses strict type safety and a responsive UI design:

- **Frontend Framework:** React 18+

- **Language:** TypeScript (utilizing strict interfaces to enforce data contracts).

- **State Management:** React Context API & useReducer (for unidirectional state management).

- **Mapping Engine:** MapLibre GL JS via react-map-gl

- **UI & Layout:** Material UI (MUI) v5. The layout uses viewport lock to ensure the map remains fixed while floating panels handle their own internal scrolling.

---

## 📦 Run the Project Locally

To set up and run this project on your own machine, follow these steps:

### Prerequisites

- Node.js
- npm or yarn

### Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/bobzoob/dhimapp.git
    ```

2.  **Navigate into the project directory:**

    ```bash
    cd dhimapp
    ```

3.  **Install the dependencies:**

    ```bash
    npm install
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:5173`.

You mide have to install several packages/libraries based on your individual setup.

---

## 🧩 Architecture

The framework is built on a **unidirectional data flow**. To achieve "Data Blindness," the core engine holds no hardcoded references to specific data fields. Instead, it relies entirely on configuration mappings to pass data through a predictable cycle: **State Mutation $\rightarrow$ Selector Pipeline $\rightarrow$ UI/Map Rendering**.

### State Management (`appContext.tsx` & `appReducer.ts`)

The application state lives inside a single `AppState` object, defined in `types/state.ts` and provided globally by `appContext.tsx`. State mutations are exclusively handled by dispatched actions in `appReducer.ts`.

The state is divided into functional categories:

1.  **Data State:** Holds `rawSources` (the original fetched GeoJSON), `dictionaries` (entity resolution maps), and `processedData` (the final, sanitized data fed to the map).
2.  **Control State:** Holds the `layerConfig` (visibility, active filters, base filters), `committedTimeRange` (the global timeline boundaries), and `highlightedFeatures` (arrays of IDs for multi-selection).
3.  **UI State:** Manages which panels are collapsed (`isLayerPanelCollapsed`, etc.), the active mobile view, and Story Mode progression.

When a user interacts with the app, an action (like `SET_COMMITTED_TIME_RANGE`) is dispatched to `appReducer.ts`. The reducer updates the Control State, which automatically triggers the Selector Pipeline.

### The Processing Pipeline (`selectors.ts`)

The `computeProcessedData` function inside `selectors.ts` is a memoized selector that transforms raw GeoJSON into map-ready data whenever the Control State changes. It executes this pipeline:

1.  **Filter (`filterUtils.ts`):**
    The engine evaluates every feature against the layer's configuration.
    - _Base Filters:_ It runs `evaluateBaseFilter` to process recursive `AND`/`OR` etc. logic.
    - _Temporal Filters:_ It uses `resolveMappedField` to check the feature's date against the global timeline and utilizing fallback chains.
    - _Plugin Filters:_ It applies active user-facing filters by calling the specific predicate functions defined in the `filterRegistry.ts`.
2.  **Sanitize (ID Promotion):**
    MapLibre requires every feature to have a unique, top-level string `id` for hover and selection states to work. The sanitizer reads the `mapping.id` from the source configuration, extracts that value from the feature's properties and promotes it to top-level GeoJSON `id` field.
3.  **Process / Aggregate:**
    If a layer has a `processor` configured, the engine runs mathematical transformations on the filtered data. By running this after filtering, aggregations remain reactive to the timeline. For example, it calls functions from `processorRegistry.ts` (like `aggregateByProperty`) to dynamically group individual features together on the current time range.

The map and UI components only consume the final `processedData` output of this pipeline.

### The Registry Pattern

The engine works with **Registry Patterns** to keep the core functionalities separated. A specific rendering or filtering logic can be decoupled into modular plugins, allowing developers to extend the app without touching the core engine files.

- **`layerRegistry.ts`:** Maps a string type (like `"point"`, `"line"`, `"polygon"`) to a specific React component (like `PointLayer.tsx`, `ArrowLayer.tsx`). The `LayerWrapper.tsx` uses this registry to dynamically render the correct MapLibre layers based on the JSON config.
- **`filterRegistry.ts`:** Maps a filter ID (like `"dateRange"`, `"entitySearch"`) to a specific UI component (for the Options Panel) and a `predicate` function. The engine passes the feature and the mapping to this predicate to determine if the feature should be rendered.
- **`processorRegistry.ts`:** Maps a processor ID (like `"aggregateByProperty"`) to a data transformation function. This allows developers to write custom clustering or mathematical algorithms that the pipeline can execute during the "Process" step.
- **`componentRegistry.ts`:** Maps custom UI component IDs to customized React components. If a popup template requires a highly specific layout (like a custom header), the `FeatureDetailPanel.tsx` looks it up here and injects it into the generic popup flow.

---

## 📝 The Data Contract (GeoJSON & Dictionaries)

The framework requires data to be provided in two distinct formats: **GeoJSON** (for spatial data and properties) and **Dictionaries** (for entity resolution).

### The Dictionary Pattern

Instead of human-readable names, the framework uses IDs in the GeoJSON data sets. These IDs are resolved at runtime using Dictionaries. This keeps the GeoJSON lightweight and allows for multilingual or updated labels without altering the spatial data. The Framework uses geospazial data directly inside the data sets to increase the performance and therefore utilizes the GeoJSON format. It is recommended to include the geospazial data in the Dictionaries to maintain human readability.

**Example Dictionary (`entities.json`):**

```json
{
  "gnd:4028557-1": {
    "name": "Jena",
    "type": "Place",
    "authority": {
      "gnd": "4028557-1",
      "geonames": "2895044"
    },
    "coordinates": [11.5899, 50.92878]
  },
  "gnd:118607960": {
    "name": "August Wilhelm von Schlegel",
    "type": "Person"
  }
}
```

### GeoJSON Structure

Spatial data must be provided as a standard GeoJSON `FeatureCollection`. Properties should rely on Dictionary IDs where applicable. The framework also supports nested data, the engine can parse nested data for drill-down tables.

**Example GeoJSON Feature:**

```json
{
  "type": "Feature",
  "id": "00001",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [13.73832, 51.05089],
      [13.41053, 52.52437]
    ]
  },
  "properties": {
    "sender_ids": ["gnd:118607960"],
    "recipient_ids": ["gnd:118540238"],
    "date_start": "1801-02-21",
    "date_sort": "1801-02-28",
    "is_local": false,
    "activity_log": [["gnd:118607960", "1801-02-21"]]
  }
}
```

---

## 💻 Developer Guide (Configuration & Usage)

Because the engine is content-agnostic, developers can build the application entirely through configuration files.

### Step 1: Registering Sources (`sources.ts`)

Sources define where the data lives and how the engine should read it. The `mapping` object translates your specific GeoJSON properties into concepts the engine understands.

**Fallback Chains:** You can provide an array of strings for fields like `dateStart`. The engine will check them in order, falling back to the next key if the previous one is `null`.

```typescript
export const sources: Record<string, SourceConfig> = {
  "my-data-set": {
    id: "my-data-set",
    url: "/my-data-set.geojson",
    type: "geojson",
    dictionaryId: "my_entities",
    mapping: {
      id: "id",
      title: "title_field",
      dateStart: ["date_start", "date_sort"],
      dateEnd: ["date_end", "date_sort"],
      children: "children",
      textSearch: ["text_field"],
      entityRefs: ["sender_ids", "recipient_ids"], // fallback chain
    },
  },
};
```

### Step 2: Configuring Layers (`layers.ts`)

Layers define how a source is filtered, processed, and rendered.

- **`baseFilter`:** Uses a strict discriminated union to allow complex `AND`/`OR` logic.
- **`interactionConfig.groupingField`:** Tells the engine to dynamically group features that share a value (like to highlighting all features with the same `date_start` when one is clicked).
- **`tableConfig`:** Declaratively formats data for the Data Table.

```typescript
{
  id: "my-layer-ID",
  sourceId: "my-data-set-ID",
  templateId: "my-template-ID",
  name: "My Name",
  type: "point",

  // Base Filter lets you deside, what data from the data-set
  // should be rendered on this layer
  // in this example we render only features where:
  // - field "has_coordinates" equals true
  // - AND field "is_local" equals true OR field "origin_id" is null.
  baseFilter: {
    logic: "AND",
    conditions: [
      { field: "has_coordinates", operator: "eq", value: true },
      {
        logic: "OR",
        conditions: [
          { field: "is_local", operator: "eq", value: true },
          { field: "origin_id", operator: "isNull" }
        ]
      }
    ]
  },

// You can group features together by
// determining on what conditions they should group.
// Here we are grouping all features with the same value for field "data_start" .
  interactionConfig: {
    clickTrigger: "table",
    groupingField: "date_start",
  },

// You can configure how the data table should look like.
// You can diside what information to be displayed
// and provide a suffix.
  tableConfig: {
    primaryField: "title",
    secondaryField: "activity_log",
    secondaryFormat: "count",               // Tells engine to count the array
    secondarySuffix: "recorded activities"  // Appends text
  }
}
```

### Step 3: Popup Templates (`templates.ts`)

Templates define the UI layout for the `FeatureDetailPanel`, the panel that shows one unique feature. By setting `resolveEntities: true`, the engine automatically looks up the raw GeoJSON IDs in your Dictionary and renders human-readable names.

```typescript
export const popupTemplates: Record<string, PopupFieldConfig[]> = {
  "my-template": [
    { field: "title", type: "header" },
    { field: "description", type: "long-text" },
    // Renders a horizontal wrap of chips
    {
      field: "gnd_activity",
      label: "Active Persons",
      type: "list",
      resolveEntities: true,
    },
    // Renders a vertical list with subtitles (Name + Date)
    {
      field: "activity_log",
      label: "Timeline",
      type: "timed-list",
      resolveEntities: true,
    },
  ],
};
```

### Step 4: Story Mode (`storyConfig.ts`)

Story Mode allows researchers to create guided narrative tours. A story is an array of `frames`. Each frame controls the timeline, layer visibility, and an unrestricted array of features to highlight simultaneously.

```typescript
export const availableStories: StoryConfig[] = [
  {
    id: "my-story-1",
    title: "My Story",
    author: "My Name",
    frames: [
      {
        id: "frame-0",
        title: "My 1 Frame Title",
        text: "This is a markdown aknowledging text field",
        timeRange: [1796, 1799],
        visibleLayers: ["my-layer-ID-1", "my-layer-ID-2"], // which layers are toggled on
        highlights: [
          { layerId: "my-layer-ID-1", featureId: "gnd:4028557-1" }, // highlights a singe feature
        ],
      },
    ],
  },
];
```

### Step 5: Theming (`mapTheme.ts`)

All visual branding is centralized in `src/config/mapTheme.ts` using Material UI's `createTheme`.

The framework uses three primary palettes:

- **`primary`:** Greys/Neutrals (Standard UI elements).
- **`secondary`:** Orange (`#ff9800`) (Standard data exploration highlights).
- **`info`:** Light Blue (`#29b6f6`) (Reserved exclusively for Story Mode).

**Dynamic Component Overrides:**
To ensure components like Buttons and Sliders adapt to Story Mode, the theme uses dynamic overrides based on the `ownerState`. If a component requests the `info` color, it receives the Story Mode blue; otherwise, it defaults to the standard orange.

```typescript
MuiIconButton: {
  styleOverrides: {
    root: ({ ownerState, theme }) => {
      let mainColor = theme.palette.secondary.main; // default Orange
      if (ownerState.color === "info") mainColor = theme.palette.info.main; // story mode Blue

      return {
        color: mainColor,
        backgroundColor: "#424242",
        "&:hover": { borderColor: "#ffffff" },
      };
    },
  },
}
```

---

## Extending the Framework

Because the framework relies on the **Registry Pattern**, extending its capabilities is safe and modular. You dont need to modify the core engine (like `selectors.ts` or `appReducer.ts`) to add new visual features or filtering logic. Instead, you create a new module and register it.

Here is how to implement the three most common extensions.

### Adding a New Layer Type

If you want to visualize data in a new way, you create a new MapLibre layer component and register it.

**Step 1: Create the Component (`HeatmapLayer.tsx`)**
Create a new file in `src/components/map/layers/`. It must accept `LayerComponentProps` so the `LayerWrapper` can pass it the processed data and highlight states.

```tsx
import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { LayerComponentProps } from "../../../types/state";

export default function HeatmapLayer({
  id,
  data,
  intensityField,
}: LayerComponentProps) {
  const sourceId = `${id}-source`;
  const heatmapLayerId = `${id}-heatmap`;

  const heatmapStyle: LayerProps = {
    id: heatmapLayerId,
    type: "heatmap",
    paint: {
      // here we use the intensityField from the layer config to weight the heatmap
      "heatmap-weight": ["get", intensityField || "weight"],
      "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(33,102,172,0)",
        0.2,
        "rgb(103,169,207)",
        1,
        "rgb(178,24,43)",
      ],
    },
  };

  return (
    <Source id={sourceId} type="geojson" data={data as any}>
      <Layer {...heatmapStyle} />
    </Source>
  );
}
```

**Step 2: Register the Layer (`layerRegistry.ts`)**
Import your new component and add it to the registry. You must also define which MapLibre layer IDs are "interactive" (clickable/hoverable). In the exapmle we return an empty array.

```typescript
import HeatmapLayer from "../components/map/layers/HeatmapLayer";

export const layerRegistry: Record<string, any> = {
  point: { Component: PointLayer, getInteractiveIds: (id) => [`${id}-circle`] },
  line: { Component: ArrowLayer, getInteractiveIds: (id) => [`${id}-lines`] },

  // we register the heatmap
  heatmap: {
    Component: HeatmapLayer,
    getInteractiveIds: () => [],
  },
};
```

**Step 3: Use it in `layers.ts`**
You can now set `type: "heatmap"` on any layer configuration.

---

### Adding a New Filter

To add a new way for users to filter data, you need a UI component and a predicate function.

**Step 1: Define the Filter in `filterRegistry.ts`**
The registry requires a UI component, a default value, a formatter (for the Active Filters panel), and the `predicate` function that the engine will run against every feature.

```typescript
// in this example we register a slider,
// that lets your set a minimum for a specific value in your data
import MinMentionsUI from "../components/filters/MinMentionsUI";

export const filterRegistry: Record<string, FilterModule> = {
  // after the existing filters
  // you add

  minMentions: {
    id: "minMentions",
    label: "Minimum Mentions",
    defaultValue: 0,
    component: MinMentionsUI, // you have to write the React component
    formatValue: (val) => `> ${val} mentions`,

    predicate: (feature, value, entities, mapping) => {
      if (value === 0) return true;

      // if you added `mentionsCount` to your FieldMapping interface
      const count = feature.properties[mapping.mentionsCount];
      return count >= value;
    },
  },
};
```

**Step 2: Add it to a Layer (`layers.ts`)**

```typescript
// give the new filter option it a place in the Options panel
activeFilters: [
  { moduleId: "minMentions", placement: "search-area", section: "advanced" },
];
```

---

### Adding Custom UI Components (Popups)

While the `templates.ts` file handles classig UI components (like lists, text, tags, etc.), you can still add customized layout (like a complex Correspondence Header with specific routing logic).

**Step 1: Create the Component**
Create a React component that accepts the feature and the dictionary.

```tsx
import { Typography, Box } from "@mui/material";

export const CustomCorrespondenceHeader = ({ feature, entities, params }) => {
  const senders = feature.properties.sender_ids
    .map((id) => entities[id]?.name)
    .join(", ");
  const recipients = feature.properties.recipient_ids
    .map((id) => entities[id]?.name)
    .join(", ");

  return (
    <Box sx={{ borderBottom: "2px solid #ff9800", mb: 2, pb: 1 }}>
      <Typography variant="caption" color="secondary">
        Letter Exchange
      </Typography>
      <Typography variant="h6">
        {senders} ➔ {recipients}
      </Typography>
    </Box>
  );
};
```

**Step 2: Register it (`componentRegistry.ts`)**

```typescript
import { CustomCorrespondenceHeader } from "../components/custom/CustomCorrespondenceHeader";

export const customPopupComponents: Record<string, React.FC<any>> = {
  CorrespondenceHeader: CustomCorrespondenceHeader,
};
```

**Step 3: Use it in `templates.ts`**
Tell the popup template to use the `custom` type and reference your registered ID.

```typescript
export const popupTemplates: Record<string, PopupFieldConfig[]> = {
  "my-detail": [
    {
      type: "custom",
      componentId: "CorrespondenceHeader",
      field: "id", // this field is now obsolete, but we need it to satisfy the interface
    },
    { field: "text_field", type: "long-text" },
  ],
};
```
