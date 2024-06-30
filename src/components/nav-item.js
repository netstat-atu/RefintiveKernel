import React from 'react';

//** next */
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

//** mui */
import { Box, Button, Collapse, List, ListItem } from '@mui/material';

//** service */
import { pathNameBaseOnStage } from '../services/configHandle';

//** icon */
import { ChevronRight, ExpandMore } from '@mui/icons-material';

export const NavItem = (props) => {
  const { href, icon, title, items, ...others } = props;
  const router = useRouter();
  const active = href ? (router.pathname === href) : false;
  const isCollapse = typeof items !== 'undefined' && items.length > 0 ? true : false
  const [open, setOpen] = React.useState(false);
  const handleClick = () => setOpen(!open);

  return (
    isCollapse ? <>
      <ListItem
        disableGutters
        sx={{
          display: 'flex',
          mb: 0.5,
          py: 0
        }}
        {...others}
      >
        <Button
          onClick={handleClick}
          startIcon={icon}
          sx={{
            backgroundColor: items?.some((child, key) => (router.pathname === child.href && true)) && 'rgba(255,255,255, 0.08)',
            borderRadius: 0,
            color: 'neutral.100',
            fontWeight: open && 'fontWeightBold',
            justifyContent: 'flex-start',
            px: 4,
            textAlign: 'left',
            textTransform: 'none',
            width: '100%',
            '& .MuiButton-startIcon': {
              color: 'neutral.100'
            },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255, 0.08)'
            }
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {title}
          </Box>
          {open ? <ExpandMore /> : <ChevronRight />}
        </Button>

      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items?.map((child, key) => {
            const activeChild = child.href ? (router.pathname === child.href) : false;
            return (
              <ListItem
                key={key}
                disableGutters
                sx={{
                  display: 'flex',
                  mb: 0.5,
                  py: 0,

                }}
              >
                <NextLink href={pathNameBaseOnStage(child.href)} passHref >
                  <Button
                    sx={{
                      backgroundColor: activeChild && 'rgba(255,255,255, 0.08)',
                      borderRadius: 0,
                      color: 'neutral.100',
                      fontWeight: activeChild && 'fontWeightBold',
                      justifyContent: 'flex-start',
                      px: 4,
                      textAlign: 'left',
                      textTransform: 'none',
                      width: '100%',
                      '& .MuiButton-startIcon': {
                        color: 'neutral.100'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255, 0.08)'
                      }
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      {child.title}
                    </Box>
                  </Button>
                </NextLink>
              </ListItem>
            )
          })}
        </List>
      </Collapse>
    </> :
      <ListItem
        disableGutters
        sx={{
          display: 'flex',
          mb: 0.5,
          py: 0,

        }}
        {...others}
      >
        <NextLink href={pathNameBaseOnStage(href)} passHref >
          <Button
            onClick={handleClick}
            startIcon={icon}
            sx={{
              backgroundColor: active && 'rgba(255,255,255, 0.08)',
              borderRadius: 0,
              color: 'neutral.100',
              fontWeight: active && 'fontWeightBold',
              justifyContent: 'flex-start',
              px: 4,
              textAlign: 'left',
              textTransform: 'none',
              width: '100%',
              '& .MuiButton-startIcon': {
                color: 'neutral.100'
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255, 0.08)'
              }
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              {title}
            </Box>
          </Button>
        </NextLink>
      </ListItem>

  );
};

NavItem.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.string
};
