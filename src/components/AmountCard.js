import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import { indianFormat } from '../utils';

export const AmountCard = ({ title, amount, sx, icon }) => (

    <Card sx={{ flex: 1, ...sx }}>
        <CardContent sx={{ alignItems: "center" }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={'center'}>
                <Avatar
                    sx={{
                        backgroundColor: '#d3eafd',
                        height: 40,
                        width: 40
                    }}
                >
                    {icon}
                </Avatar>
                <Typography
                    sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 1,
                        ml: 2
                    }}
                    variant="heading" >
                    {title}
                </Typography>
            </Stack>
            <Typography sx={{ mt: 2 }} variant="h5" >
                {amount ? amount > 0 ? `₹  ${indianFormat(amount)}` : `₹  ${(amount)}` : `₹  0`}
            </Typography>
        </CardContent>
    </Card>

)
