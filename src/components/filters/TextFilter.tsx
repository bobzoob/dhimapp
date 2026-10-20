import {
  Stack,
  TextField,
  Autocomplete,
  Chip,
  Paper,
  Typography,
} from "@mui/material";
import type { FilterComponentProps } from "../../types/filter";

function TextFilter({ value, onChange, label }: FilterComponentProps) {
  // value is expected to be string here
  const currentTerms: string[] = Array.isArray(value) ? value : [];

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">{label || "Text Search"}</Typography>
        <Autocomplete
          multiple
          freeSolo
          options={[]} // purely free-text tags
          value={currentTerms}
          onChange={(_event, newValue) => {
            // Filter out empty strings or whitespaces
            const cleaned = (newValue as string[])
              .map((t) => t.trim())
              .filter(Boolean);
            onChange(cleaned);
          }}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip key={key} label={option} size="small" {...tagProps} />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder={
                currentTerms.length === 0
                  ? "Type and press Enter..."
                  : "Add another..."
              }
            />
          )}
        />
      </Stack>
    </Paper>
  );
}

export default TextFilter;
