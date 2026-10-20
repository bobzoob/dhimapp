import {
  Autocomplete,
  TextField,
  Paper,
  Stack,
  Chip,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useAppState } from "../../state/appContext";
import type { FilterComponentProps } from "../../types/filter";

function EntityFilter({
  layerId,
  value,
  onChange,
  label,
  params,
}: FilterComponentProps) {
  const { state } = useAppState();
  const { dictionaries, layerConfig, sources } = state;

  // we vae to determine, if we use this as role-secific filter (liek sender/recipiant) or entity search
  const isPlainArray = Array.isArray(value);
  const terms: string[] = isPlainArray ? value : value?.terms || [];
  const mode: "all" | "any" = isPlainArray ? "any" : value?.mode || "all";

  // to show suggestions
  const useSuggestions = params?.useSuggestions === true;

  // if suggestions are enabled, prepare the list
  let uniqueOptions: string[] = [];

  if (useSuggestions) {
    const layer = layerConfig.find((l) => l.id === layerId);
    const source = layer ? sources[layer.sourceId] : null;
    const dictionaryId = layer?.dictionaryId || source?.dictionaryId;
    const dictionary = dictionaryId ? dictionaries[dictionaryId] : {};

    const options = Object.values(dictionary)
      .filter((entity) => {
        // Filter by type if specified
        if (params?.suggestionType) {
          return (
            entity.type?.toLowerCase() === params.suggestionType.toLowerCase()
          );
        }
        return true;
      })
      .map((entity) => entity.name)
      .sort();

    uniqueOptions = Array.from(new Set(options));
  }

  const handleTermsChange = (newTerms: string[]) => {
    const cleaned = Array.from(
      new Set(newTerms.map((t) => t.trim()).filter(Boolean))
    );
    if (isPlainArray) {
      onChange(cleaned);
    } else {
      onChange({ terms: cleaned, mode });
    }
  };

  const handleModeChange = (_: any, newMode: "all" | "any" | null) => {
    if (newMode && !isPlainArray) {
      onChange({ terms, mode: newMode });
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        padding: 2,
        bgcolor: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        marginTop: 1,
      }}
    >
      <Stack spacing={1}>
        <Autocomplete
          multiple
          freeSolo
          options={useSuggestions ? uniqueOptions : []}
          value={terms}
          // update state when an option is selected or typed
          onChange={(_e, newValue) => handleTermsChange(newValue as string[])}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip key={key} label={option} size="small" {...tagProps} />
              );
            })
          }
          renderInput={(paramsInput) => (
            <TextField
              {...paramsInput}
              label={label}
              variant="outlined"
              size="small"
              fullWidth
              placeholder={
                terms.length === 0 ? "Select or type..." : "Add another..."
              }
            />
          )}
        />
        {/* this toggle appears only for configurable entity search when > 1 term */}
        {!isPlainArray && terms.length > 1 && (
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
              value={mode}
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
export default EntityFilter;
