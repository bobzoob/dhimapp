import { Stack, TextField, Paper, Typography, Box } from "@mui/material";
import type { FilterComponentProps } from "../../types/filter";
import { useAppState } from "../../state/appContext";

interface DateRangeValue {
  start: string;
  end: string;
}

function DateFilter({ value, onChange, label }: FilterComponentProps) {
  const { state } = useAppState();

  // boundaries from state
  const { min, max } = state.settings.timeRange;

  //format the boundaries for the HTML date input (YYYY-MM-DD)
  const minDateStr = `${min}-01-01`;
  const maxDateStr = `${max}-12-31`;

  // helper for very old years, uncomment if nessesary:
  // const padYear = (year: number) => String(year).padStart(4, '0');
  // const minDateStr = `${padYear(min)}-01-01`;

  const current = (value as DateRangeValue) || { start: "", end: "" };

  const update = (updates: Partial<DateRangeValue>) => {
    onChange({ ...current, ...updates });
  };

  return (
    <Paper variant="outlined" sx={{ padding: 2, bgcolor: "transparent" }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">{label || "Date Range"}</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            label="From"
            type="date"
            size="small"
            fullWidth
            // tell the browser which century to show
            inputProps={{
              min: minDateStr,
              max: maxDateStr,
            }}
            InputLabelProps={{ shrink: true }}
            value={current.start}
            onChange={(e) => update({ start: e.target.value })}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            fullWidth
            inputProps={{
              min: minDateStr,
              max: maxDateStr,
            }}
            InputLabelProps={{ shrink: true }}
            value={current.end}
            onChange={(e) => update({ end: e.target.value })}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

export default DateFilter;
