import { useState, useEffect } from "react";
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import { Stack, Slider } from '@material-ui/core';
import Box from '@material-ui/core/Box';

type Props = {audio: HTMLAudioElement};
export const VolumeControl = ({audio}:Props) => {
        const [value, setValue] = useState(50);
        useEffect(() => {
            audio.volume = value / 100;
        }, [audio]);

        const handleChange = (event: any, value: any) => {
                setValue(value);
                audio.volume = value/100;
        }
        return (
                <Box sx={{ width: 200 }}>
                        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                                <VolumeDownIcon />
                                <Slider aria-label="Volume" value={value} onChange={handleChange} />
                                <VolumeUpIcon />
                        </Stack>
                </Box>
        )
}