import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Button, Collapse, Link as MuiLink } from '@mui/material';
import { ExpandLess, ExpandMore, Key } from '@mui/icons-material';
import styles from './navbar.module.scss';

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
    drawerWidth: number;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open, drawerWidth }) => ({
    backgroundColor: '#52BDFF',
    color: "#000000",
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

interface NavbarProps {
    user: UserStatus,
    handleLogout: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    drawerWidth: number
    lists: ({
        key: string;
        label: string;
        icon: JSX.Element;
        link: string;
        nested?: undefined;
        items?: undefined;
    } | {
        key: string;
        label: string;
        icon: JSX.Element;
        nested: boolean;
        items: {
            key: string;
            label: string;
            icon: JSX.Element;
            link: string;
        }[];
        link?: undefined;
    })[]
}

export default function Navbar({ user, handleLogout, drawerWidth, lists }: NavbarProps) {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [openedKey, setOpenedKey] = React.useState("")

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleClick = (key: string) => () => {
        setOpenedKey(key == openedKey ? "" : key)
    }

    return (
        <>
            <CssBaseline />
            <AppBar position="sticky" open={open} drawerWidth={drawerWidth}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        <MuiLink href="/" color="inherit" underline="none">
                            Meow
                        </MuiLink>
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {lists.map((item, index) => (
                        <div key={index}>
                            <ListItem style={{ color: "#0E4277" }} component={MuiLink} href={item.link || "javascript:void(0);"} key={item.key} disablePadding onClick={handleClick(item.key)}>
                                <ListItemButton>
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} />
                                    {item.nested && (openedKey === item.key ? <ExpandLess /> : <ExpandMore />)}
                                </ListItemButton>
                            </ListItem>
                            {item.nested && <Collapse in={openedKey === item.key}>
                                <List disablePadding >
                                    {item.items?.map((childItem, index) => (
                                        <ListItem key={childItem.key} style={{ color: "#0E4277", paddingLeft: "30px" }} component={MuiLink} href={childItem.link || "javascript:void(0);"}>
                                            <ListItemButton>
                                                <ListItemIcon>
                                                    {childItem.icon}
                                                </ListItemIcon>
                                                <ListItemText primary={childItem.label} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>}
                        </div>
                    ))}
                </List>
                <Divider />
                {!user?.isAuthenticated && (
                    <ListItem button>
                        <Button href="/" variant="outlined" color="inherit">
                            Log In
                        </Button>
                    </ListItem>
                )}
                {!user?.isAuthenticated && (
                    <ListItem button>
                        <Button href="/" variant="contained" color="inherit">
                            Sign Up
                        </Button>
                    </ListItem>
                )}
                {user?.isAuthenticated && (
                    <ListItem>
                        <Button onClick={handleLogout} variant="contained" color="inherit">
                            Sign Out
                        </Button>
                    </ListItem>
                )}
            </Drawer>
        </>
    );
}