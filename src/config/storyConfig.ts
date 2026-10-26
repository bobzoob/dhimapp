import type { StoryConfig } from "../types/state";

/**
 * THIS IS WHERE YOU SET UP YOUR STORIES
 */

export const availableStories: StoryConfig[] = [
  {
    id: "story-1",
    title: "Das Jena Netzwerk",
    author: "by Admin", // this can serve as a subtitle
    frames: [
      {
        id: "frame-0",
        title: "Die Anfänge",
        text: "In den frühen 1790ern formte sich ein Netzwerk um die Schlegel Brüder: der Beginn der deutschen Romantik.",
        timeRange: [1790, 1796],
        visibleLayers: ["letters-lines", "local-letter-hubs"],
        highlights: [],
        camera: {
          center: [11.5899, 50.92878],
          zoom: 5,
        },

        // we can filter the map data for this frame (logic hidden for user)
        // we use the baseFilter logic here
        storyFilters: {
          "letters-lines": {
            field: "full_text",
            operator: "contains",
            value: "Jena",
          },
        },
      },
      {
        id: "frame-1",
        title: "Die Jena Jahre",
        text: "In den späten 1790ern, wurde [Jena](https://de.wikipedia.org/wiki/Jena) zum Zentrum dieser frühromantischen Bewegung. Viele Briefpartner des Netzwerks lebten in der Stadt selbst oder im nahen Umland.",
        timeRange: [1796, 1799],
        image: {
          url: "https://upload.wikimedia.org/wikipedia/commons/b/b6/View_of_Jena.jpg",
          signature: "© 17-century view of Jena, Public Domain",
        },
        visibleLayers: ["letters-lines", "local-letter-hubs"],
        highlights: [
          { layerId: "local-letter-hubs", featureId: "gnd:4028557-1" },
        ],
        camera: {
          center: [11.5899, 50.92878], // coordinates MUST have this format[lng, lat]!
          zoom: 7, // soom level
          pitch: 45, //  we can also change camera angle
        },
      },
      {
        id: "frame-2",
        title: "Der Kreis erweitert sich",
        text: "Um 1801 expandiert das Netzwerk zunächst Richtung Frankreich und den Niederlanden bevor es sich schließlich stärker Richtung Berlin orientiert.",
        timeRange: [1800, 1802],
        visibleLayers: ["letters-lines", "local-letter-hubs"],
        highlights: [
          { layerId: "local-letter-hubs", featureId: "gnd:4028557-1" },
          { layerId: "local-letter-hubs", featureId: "gnd:2004272-3" },
        ],
        camera: {
          center: [13.41053, 52.52437],
          zoom: 7,
        },
      },
    ],
  },
  {
    id: "story-2",
    title: "Example Story 2",
    author: "Author Name",
    frames: [
      {
        id: "frame-0",
        title: "Some Heading",
        text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.",
        timeRange: [1790, 1799],
        visibleLayers: ["grouping-layer"],
        highlights: [
          // highlight the specific letter line using its GeoJSON ID
          { layerId: "grouping-layer", featureId: "AWS-aw-01ej" },
          { layerId: "grouping-layer", featureId: "AWS-aw-02k2" },
        ],
        storyFilters: {
          "grouping-layer": {
            field: "full_text",
            operator: "contains",
            value: "Schlegel",
          },
        },
      },
      {
        id: "frame-1",
        title: "Some Other Heading",
        text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. .",
        timeRange: [1800, 1802],
        visibleLayers: ["grouping-layer", "local-letter-hubs"],
        highlights: [{ layerId: "grouping-layer", featureId: "AWS-aw-09ge" }],
      },
    ],
  },
];
