import React from 'react';
import { Box, Typography, Autocomplete, TextField, Chip } from '@mui/material';

export interface AllocationFiltersProps {
  availableAssetTypes: string[];
  availableTickers: string[];
  selectedAssetTypes: string[];
  selectedTickers: string[];
  onAssetTypesChange: (types: string[]) => void;
  onTickersChange: (tickers: string[]) => void;
}

export const AllocationFilters: React.FC<AllocationFiltersProps> = ({
  availableAssetTypes,
  availableTickers,
  selectedAssetTypes,
  selectedTickers,
  onAssetTypesChange,
  onTickersChange,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
      <Box sx={{ flex: 1, minWidth: 200 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Asset Types
        </Typography>
        <Autocomplete
          multiple
          options={availableAssetTypes}
          value={selectedAssetTypes}
          onChange={(_event, newValue) => {
            onAssetTypesChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select asset types"
              aria-label="Filter by asset types"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
              />
            ))
          }
          size="small"
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 200 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Tickers
        </Typography>
        <Autocomplete
          multiple
          options={availableTickers}
          value={selectedTickers}
          onChange={(_event, newValue) => {
            onTickersChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select tickers"
              aria-label="Filter by ticker symbols"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
              />
            ))
          }
          size="small"
        />
      </Box>
    </Box>
  );
};
