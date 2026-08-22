import { useState, useEffect } from "react";
import { VolumeDown as VolumeDownIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import { Stack, Slider } from '@mui/material';
import Box from '@mui/material/Box';
import { usePersist } from "../util";

type Props = {audio: HTMLAudioElement, name: string};
export const VolumeControl = ({audio, name}:Props) => {
        const [value, setValue] = usePersist("volume" + name, 50);
        useEffect(() => {
            audio.volume = value / 100;
        }, [audio, value]);

        const handleChange = (event: any, value: any) => {
                setValue(value);
                audio.volume = value/100;
        }
        return (
                <Box sx={{ width: 200 }}>
                        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                                <VolumeDownIcon onClick={() => setValue(0)} />
                                <Slider aria-label="Volume" value={value} onChange={handleChange} />
                                <VolumeUpIcon />
                        </Stack>
                </Box>
        )
}
