import { Typography } from "@mui/material";
function AvailabilityWarning({ warningText }) {
  return (
    <Typography marginLeft={2} align="center" variant="caption" color="error">
      {warningText}
    </Typography>
  );
}

export default AvailabilityWarning;
