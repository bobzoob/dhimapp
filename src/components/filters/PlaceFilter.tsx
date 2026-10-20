import {
  Stack,
  TextField,
  Paper,
  Autocomplete,
  Chip,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useAppState } from "../../state/appContext";
import type { FilterComponentProps } from "../../types/filter";

interface PlaceFilterValue {
  terms: string[];
  mode: "all" | "any";
}

function PlaceFilter({
  layerId,
  value,
  onChange,
  params,
}: FilterComponentProps) {
  const { state } = useAppState();
  const { dictionaries, layerConfig, sources, processedData } = state;

  // defaults
  const current: PlaceFilterValue = {
    terms: Array.isArray(value?.terms) ? value.terms : [],
    mode: value?.mode || "all",
  };

  // suggestions
  const useSuggestions = params?.useSuggestions === true;
  let uniqueOptions: string[] = [];

  if (useSuggestions) {
    const layer = layerConfig.find((l) => l.id === layerId);
    const source = layer ? sources[layer.sourceId] : null;
    const dictionaryId = layer?.dictionaryId || source?.dictionaryId;
    const dictionary = dictionaryId ? dictionaries[dictionaryId] : {};

    // get the actual features for this layer from reactive pipeline
    const layerData = processedData[layerId];
    const features = layerData?.features || [];

    // collect unique IDs from specific fields
    const activePlaceIds = new Set<string>();

    features.forEach((f: any) => {
      const origin = f.properties?.origin_id;
      const target = f.properties?.target_id;
      if (origin) activePlaceIds.add(String(origin));
      if (target) activePlaceIds.add(String(target));
    });

    // we map those IDs to names using the dictionary
    const options = Array.from(activePlaceIds)
      .map((id) => dictionary[id]?.name)
      .filter(Boolean) //if an ID isnt in the dictionary we remove it
      .sort();

    uniqueOptions = Array.from(new Set(options));
  }

  // now, thats duplicated logic from other filter classes
  const handleTermsChange = (newTerms: string[]) => {
    const cleaned = Array.from(
      new Set(newTerms.map((t) => t.trim()).filter(Boolean))
    );
    onChange({ ...current, terms: cleaned });
  };

  const handleModeChange = (_: any, newMode: "all" | "any" | null) => {
    if (newMode) {
      onChange({ ...current, mode: newMode });
    }
  };

  return (
    <Paper variant="outlined" sx={{ padding: 2, bgcolor: "transparent" }}>
      <Stack spacing={2}>
        {/* <Typography variant="subtitle2" color="primary">
          {label || "Place Filter"}
        </Typography> */}

        {/* SEARCH FIELD: autocomplete or standard TextField */}
        <Autocomplete
          multiple
          freeSolo
          options={useSuggestions ? uniqueOptions : []}
          value={current.terms}
          onChange={(_e, newValue) => handleTermsChange(newValue as string[])}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip key={key} label={option} size="small" {...tagProps} />
              );
            })
          }
          renderInput={(inputParams) => (
            <TextField
              {...inputParams}
              label="Place..."
              variant="outlined"
              size="small"
              fullWidth
              placeholder={
                current.terms.length === 0 ? "Search places..." : "Add place..."
              }
            />
          )}
        />

        {/* the toggle appears when > 1 place term */}
        {current.terms.length > 1 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Match:
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={current.mode}
              exclusive
              onChange={handleModeChange}
              sx={{ height: 26 }}
            >
              <ToggleButton
                value="all"
                sx={{ px: 1, py: 0, fontSize: "0.75rem" }}
              >
                ALL
              </ToggleButton>
              <ToggleButton
                value="any"
                sx={{ px: 1, py: 0, fontSize: "0.75rem" }}
              >
                ANY
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

export default PlaceFilter;
