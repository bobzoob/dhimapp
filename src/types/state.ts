import type { BaseFilter, SourceConfig } from "./config";
import type { HistoricalFeatureCollection, EntityMap } from "./geojson";
import type { ProcessorConfig } from "./processor";
export type { FilterValue, FilterComponentProps } from "./filter";

// basic types
export type TimeRange = [number, number];
export type View =
  | "dashboard"
  | "map"
  | "documentation"
  | "license"
  | "privacy";
export type FilterPlacement = "timeline-area" | "search-area";
export type FilterState = Record<string, any>;

export interface LayerComponentProps {
  id: string;
  data: HistoricalFeatureCollection;
  showAllTooltips: boolean;
  entities: EntityMap;
  intensityField?: string; // conrol point size
  styleConfig?: PointStyleConfig;
  selectedId?: string | null;
  hoveredId?: string | null;
  highlightedIds?: string[];
}

export type PopupFieldType =
  | "header" // main title
  | "text" // simple text
  | "long-text"
  | "tags" // comma separated values ( Mentions: A, B, C)
  | "list" // vertical list (Born: A, B)
  | "timed-list" // complex list (list with differnt values: Person (Date))
  | "link-button"
  | "feature-list" // clickable list (generic)
  | "custom" // complex header
  | "composite" // concatinated string
  | "image";

export interface PopupFieldConfig {
  field: string; // key in the GeoJSON properties ("born", "activity_log")
  label?: string; // label to show ("Born:")
  type: PopupFieldType;
  resolveEntities?: boolean; // if: look up GND IDs in dictionary
  entityTypeFilter?: string;
  captionField?: string; // if image signature data exsitis in our source

  // for composit/ concatinated headers or fields
  fields?: string[];
  separator?: string;
  isHeader?: boolean;

  //for feature-list only
  listLabelField?: string; // title shown in list
  listSecondaryField?: string; // subtitle or else
  detailTemplateId?: string; // which laysers template popup should be used

  componentId?: string; // ID to look up in ComponentRegistry
  params?: Record<string, any>; // extra data for custom component

  // for linkable entities
  isLinkable?: boolean;
  linkTemplate?: string; // if field is not an entitie but an ID string ("fud")
}

export interface PointStyleConfig {
  // Color: can be a single hex string or an array for a gradient ramp
  color?: string | string[];
  // Radius: can be a single number or a min/max array
  radius?: number | [number, number];

  opacity?: number;

  strokeColor?: string;
}
export interface ActiveFilterConfig {
  moduleId: string; // references ID in registry
  placement: FilterPlacement;
  section?: "advanced" | "toggles";
  params?: Record<string, any>;
}

export interface TableConfig {
  primaryField: string;
  secondaryField?: string;
  resolvePrimary?: boolean;
  resolveSecondary?: boolean;
  componentId?: string; // optional: you can use a custom component
  templateId?: string;
  primaryFormat?: string;
  primarySuffix?: string;
  secondaryFormat?: string;
  secondarySuffix?: string;
}
export interface LayerConfig {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  visible: boolean;
  showInPanel?: boolean;
  type: string;
  group?: string;

  //references
  sourceId: string;
  templateId: string;
  //filter
  baseFilter?: BaseFilter;

  showAllTooltips?: boolean;
  hasFlashlight?: boolean; // removes the showAllTooltips Option
  // cicrle radius
  intensityField?: string;
  // some layers may not be bound to the timline, they ignore it
  ignoreTimeFilter?: boolean;

  // processor
  processor?: ProcessorConfig;

  // the current values of the filters ("text": "Goethe", "date": "1800" )
  filterValues?: FilterState;

  // which filters are active for this layer?
  activeFilters: ActiveFilterConfig[];

  // poit styling
  styleConfig?: PointStyleConfig;

  // dictionaries
  dictionaryId?: string;

  // table
  tableConfig?: TableConfig; // config for top level view
  childTableConfig?: TableConfig; // Config for the "Drilled Down" view

  // config which panel is triggert
  interactionConfig?: {
    clickTrigger?: "detail" | "table"; // Default is "detail"
    groupingField?: string; // multiselected features
    groupingFilter?: BaseFilter; // advanced grouping logic
  };

  interaction?: {
    onClick?: {
      action: "select" | "drill-down";
      targetPanel?: "detail" | "table";
    };
  };
}

// color highlighting
export interface SelectionState {
  id: string;
  layerId: string;
  latitude: number;
  longitude: number;
  templateId?: string;
}

// interfaces for nested features (letters in a city)
export interface LayerSubState {
  parentId: string | null;
  data: any[] | null;
}

// multifeatures highlighting
export interface HighlightState {
  id: string;
  layerId: string;
}

//STORY MODE
export interface StoryCamera {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface StoryFrame {
  id: string;
  title: string;
  text: string; // Markdown supported
  timeRange?: [number, number]; // timeline jumps
  visibleLayers?: string[]; // layer IDs that should be turned ON
  highlights?: { layerId: string; featureId: string }[]; // features to highlight
  camera?: StoryCamera;
  image?: { url: string; signature?: string };
  storyFilters?: Record<string, BaseFilter>; // baseFilter (hidden for user)
}

export interface StoryConfig {
  id: string;
  title: string;
  author: string;
  frames: StoryFrame[];
}

// interface that structures the data pipline
export interface AppState {
  layerSubState: Record<string, LayerSubState | null>;

  currentView: View;

  // // raw data
  // geoJsonData: Record<string, HistoricalFeatureCollection> | null;

  // raw data
  rawSources: Record<string, HistoricalFeatureCollection>;
  //processed data (result of pipline)
  processedData: Record<string, HistoricalFeatureCollection>;

  // configuration
  sources: Record<string, SourceConfig>;

  // control state
  layerConfig: LayerConfig[];

  // dictionaries
  dictionaries: Record<string, EntityMap>;

  // settings
  settings: {
    timeRange: { min: number; max: number };
    map: {
      style: string;
      defaultCenter: [number, number];
      defaultZoom: number;
    };
    [key: string]: any;
    animation: {
      speed: number;
      step: number;
      defaultWindow: number;
    };
  };

  committedTimeRange: TimeRange;
  liveTimeRange: TimeRange;
  selectedLayerId: string | null;

  // UI state
  isLayerPanelCollapsed: boolean;
  isOptionsPanelCollapsed: boolean;
  isActiveFiltersPanelCollapsed: boolean;
  isTablePanelCollapsed: boolean;
  isDetailPanelCollapsed: boolean;
  //for storyPanel
  isStoryPanelCollapsed: boolean;

  isTableLoaded: boolean;
  tablePage: Record<string, number>; // maps layerId -> current page index

  activeMobilePanel:
    | "layers"
    | "options"
    | "filters"
    | "table"
    | "detail"
    | "none";
  loadingProgress: number;

  // color highlighting
  selectedFeature: SelectionState | null;

  // drill down list
  drilledDownFeature: any | null;

  // multifeature highlighting
  highlightedFeatures: HighlightState[];

  // story mode
  isStoryModeActive: boolean;
  currentStoryIndex: number;
  storyManifest: StoryConfig | null;
}
