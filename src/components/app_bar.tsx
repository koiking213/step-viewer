import { AppBar as AppBarBase, Box, Toolbar, Typography } from "@mui/material";

import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Notification from './app_bar/notification';

type Props = {
    appName: string;
};
const AppBar = ({ appName }: Props) => {
    return (
        <AppBarBase position="relative" color="inherit" elevation={1}>
            <Toolbar>
                <IconButton>
                    <MenuIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                Step Viewer 1.0.0 (date)
                <Box sx={{ flexGrow: 1 }} />
                <IconButton>
                    <Notification />
                </IconButton>
            </Toolbar>
        </AppBarBase>
    );
}

export default AppBar;