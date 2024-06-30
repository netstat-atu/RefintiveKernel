import styled from '@emotion/styled';
import { TableRow } from '@mui/material';

const StyledTableRow = styled(TableRow)(({ theme, color }) => ({
    'backgroundColor': color,
    '&:nth-of-type(odd)': { backgroundColor: color ? color : theme.palette.action.hover },
    '&:last-child td, &:last-child th': { border: 0 }
}));

export default StyledTableRow
