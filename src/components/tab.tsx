import Box from '@material-ui/core/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import React, { useState } from "react"

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

type MyTabProps = { value: number, setter: (value: number) => void };
export const MyTab = ({ value, setter }: MyTabProps) => {
  const handleChangeTab = (e: React.SyntheticEvent, newValue: number) => {
    setter(newValue);
  }
  return (
    <Tabs value={value} onChange={handleChangeTab} >
      <Tab label="song table" {...a11yProps(0)} />
      <Tab label="scores" {...a11yProps(1)} />
    </Tabs>
  )
}