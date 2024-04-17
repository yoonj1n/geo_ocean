import { styled, createTheme, ThemeProvider, } from '@mui/material/styles';
import { useState } from 'react';
import {CssBaseline,Box,Toolbar, Typography,IconButton} from '@mui/material'
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';


import pages from './subpage';

// open drawer width
const drawerWidth = '13rem';
// upside bar
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
    })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor:'#222e3b',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100vw - ${drawerWidth})`,
    backgroundColor:'#222e3b',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));


// upside bar height set
const mdTheme = createTheme({
    components:{
        MuiToolbar:{
            styleOverrides:{
                regular:{
                    minHeight:'3rem !important',
                    height:'3rem !important'
                }
            }
        }
    }
});
 
export default function MainPage(){
    const SubpageNow = pages[0];

    // side bar
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => {
        setOpen(!open);
    };

     return(
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar className='nav-bar' position="absolute" open={open}>
                <Toolbar
                    className='Nav-bar'
                    sx={{
                        pr: '5rem', // keep right padding when drawer closed
                    }}
                >
                    <img src="img/logo.png" alt="logo" className="logo"/>
                </Toolbar>
                </AppBar>
                <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[100]
                        : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
                >
                <Toolbar />
                <div className="under-right">{SubpageNow}</div>
                </Box>
            </Box>
        </ThemeProvider>
 
     )
 }