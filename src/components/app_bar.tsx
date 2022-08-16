import { AppBar as AppBarBase, Box, Toolbar } from "@mui/material";

import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Notification from './app_bar/notification';

type Props = {
    appName: string;
    version: string;
    last_update: string;
};
const AppBar = ({ appName, version, last_update }: Props) => {
    return (
        <AppBarBase position="relative" color="inherit" elevation={1}>
            <Toolbar>
                <IconButton>
                    <MenuIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                {appName} {version} ({last_update})
                <Box sx={{ flexGrow: 1 }} />
                <IconButton>
                    <Notification />
                </IconButton>
            </Toolbar>
        </AppBarBase>
    );
}

export default AppBar;