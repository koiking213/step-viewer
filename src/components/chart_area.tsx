import React, { useState, useMemo } from "react";
import {
  Stage,
  Container,
  Sprite,
  useTick,
  Text,
} from "@inlet/react-pixi";
import { settings, SCALE_MODES, Texture, BaseTexture, Rectangle } from "pixi.js";
import { Stream, Gimmick, Stop, Soflan, TimingInfo, Direction, ChartContent } from "../types/index";
import { useEffect } from "react";
import { Arrow, Mine, FreezeArrow } from "./chart_area/notes";
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton';
import ReplayIcon from '@material-ui/icons/Replay';
import { VolumeControl } from './volume_control';
import { DivisionLine } from './chart_area/division_line'
import { Slider } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import TextField from '@mui/material/TextField';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';


import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { getDivision } from './chart_area/get_division';
import { usePersist } from "../util";

settings.SCALE_MODE = SCALE_MODES.NEAREST;


const arrowSize = 64;
const canvasLeftSpace = 30;
const canvasRightSpace = 80;
const canvasWidth = arrowSize * 4 + canvasLeftSpace + canvasRightSpace;
const arrowPosEpsilon = 1 / 192 * 4;

type GimmickViewer = "detail" | "icon" | "off"
type RotationMode = "mirror" | "left" | "right" | "off"
type HighSpeedMode = "ordinal" | "bpm" | "fixed"

type SoflanDetailProps = { soflans: Soflan[], highSpeed: number };
const SoflanDetail = ({ soflans, highSpeed }: SoflanDetailProps) => {
  return (
    <>
      {soflans.map(soflan => {
        const y = soflan.division * arrowSize * 4 * highSpeed + arrowSize / 2 - 16;
        return (
          <Container position={[canvasLeftSpace + arrowSize * 4, y]} key={`soflandetail-${y}-${soflan.bpm}`}>
            <Text text={`BPM:${soflan.bpm.toString()}`} style={{ fontSize: 12, fill: "white" }} />
          </Container>
        )
      })}
    </>
  );
}

type SoflanIconProps = { soflans: Soflan[], highSpeed: number };
const SoflanIcon = ({ soflans, highSpeed }: SoflanIconProps) => {
  // 先頭は初期BPMのためアイコンは不要
  return (
    <>
      {soflans.slice(1).map((soflan, i) => {
        const y = soflan.division * arrowSize * 4 * highSpeed + arrowSize / 2 - 16;
        const faster = soflan.bpm > soflans[i].bpm;
        const source = faster ? "/skin/speed_up.png" : "/skin/speed_down.png";
        return (
          <Sprite image={source} x={canvasLeftSpace + arrowSize * 4 + 10} y={y} height={32} width={32} key={`soflanicon-${y}`} />
        )
      })}
    </>
  );
}

type StopDetailProps = { stops: Stop[]; highSpeed: number };
const StopDetail = ({ stops, highSpeed }: StopDetailProps) => {
  return (
    <>
      {stops.map(stop => {
        const y = stop.division * arrowSize * 4 * highSpeed + arrowSize / 2 + 0;
        return (
          <Container position={[canvasLeftSpace + arrowSize * 4, y]} key={`stopdtail-${y}-${stop.time}`}>
            <Text text={`STOP:${stop.time.toString()}`} style={{ fontSize: 12, fill: "white" }} />
          </Container>
        )
      })}
    </>
  );
};

type StopIconProps = { stops: Stop[]; highSpeed: number };
const StopIcon = ({ stops, highSpeed }: StopIconProps) => {
  return (
    <>
      {stops.map(stop => {
        const y = stop.division * arrowSize * 4 * highSpeed + arrowSize / 2 - 16;
        return <Sprite image={"/skin/stop.png"} x={canvasLeftSpace + arrowSize * 4 + 10 + 32} y={y} height={32} width={32} key={`stopicon-${y}`} />
      })}
    </>
  );
};


type CanvasMetaInfoProps = { stream: Stream, highSpeed: number, gimmick: Gimmick, gimmickViewer: GimmickViewer };
const CanvasMetaInfo = ({ stream, highSpeed, gimmick, gimmickViewer }: CanvasMetaInfoProps) => {
  const lastDivision = stream.stream.length === 0 ? 0 : Math.floor(stream.stream[stream.stream.length - 1].offset / 192);
  const divisionLines = lastDivision < 1 ? <></> : Array.from(Array(lastDivision), (v, k) => {
    const y = k * arrowSize * 4 * highSpeed + arrowSize / 2;
    return <DivisionLine y={y} division={k} arrowSize={arrowSize} divisionNumSpace={canvasLeftSpace} key={k} />
  })
  const Soflan = () => {
    switch (gimmickViewer) {
      case "detail": return (<SoflanDetail soflans={gimmick.soflan} highSpeed={highSpeed} />);
      case "icon": return (<SoflanIcon soflans={gimmick.soflan} highSpeed={highSpeed} />);
      case "off": return (<></>);
    }
  }
  const Stop = () => {
    switch (gimmickViewer) {
      case "detail": return <StopDetail stops={gimmick.stop} highSpeed={highSpeed} />
      case "icon": return <StopIcon stops={gimmick.stop} highSpeed={highSpeed} />
      case "off": return <></>
    }
  }
  return (
    <Container>
      {divisionLines}
      <Soflan />
      <Stop />
    </Container>
  );
}

function getNoteTextures(): { [key: string]: Texture[] } {
  const dict: { [name: string]: Texture[] } = {};
  ["red", "blue", "yellow", "green"].forEach(color => {
    ["left", "down", "up", "right"].forEach(direction => {
      // TODO: directionとcolorはtypesから取るようにする
      const y = color === "red" ? 0 : color === "blue" ? 64 : color === "yellow" ? 128 : 192;
      dict[`${direction}_${color}`] = Array.from(Array(8), (v, k) =>
        new Texture(new BaseTexture(`/skin/arrows.png`), new Rectangle(k * 64, y, 64, 64))
      )
    })
  });
  ["left", "down", "up", "right"].forEach(direction => {
    dict[`${direction}_mine`] = Array.from(Array(8), (v, k) =>
      new Texture(new BaseTexture(`/skin/${direction}_mine.png`), new Rectangle(k * 64, 0, 64, 64))
    )
  })
  return dict;
}

type CanvasProps = { stream: Stream, highSpeed: number, playing: boolean, fixedBPM: number, bpmIsFixed: boolean, rotationMode: RotationMode, audio: HTMLAudioElement, constantTime: number, chartOffset: number};
const Canvas = ({ stream, highSpeed, playing, fixedBPM, bpmIsFixed, rotationMode, audio, constantTime, chartOffset }: CanvasProps) => {
  const [time, setTime] = useState(0);
  useTick(_delta => {
    setTime(audio.currentTime);
  });
  const arrowOffsetScale = arrowSize * arrowPosEpsilon;
  const initialNoteOfs = 0;
  const yMultiplier = bpmIsFixed ? 1 : highSpeed;
  const noteTextures = useMemo(() => {
    return getNoteTextures();
  }, []);
  const rotate = (dir: Direction) => {
    switch (rotationMode) {
      case "off": return dir;
      case "mirror":
        switch (dir) {
          case "left": return "right";
          case "right": return "left";
          case "up": return "down";
          case "down": return "up";
        }
        break;
      case "left":
        switch (dir) {
          case "up": return "left";
          case "left": return "down";
          case "down": return "right";
          case "right": return "up";
        }
        break;
      case "right":
        switch (dir) {
          case "up": return "right";
          case "right": return "down";
          case "down": return "left";
          case "left": return "up";
        }
        break;
    }
  };
  const arrows = stream.stream
    .filter((division) => division.time < time + constantTime + chartOffset)
    .map((division) => {
      const hasFreeze = division.arrows.some((arrow) => arrow.type === "freeze")
      const opacity = (() => {
        if (time + constantTime + chartOffset > division.time) {
          const phaseDuration = 0.3; // duration of the fade-in phase in milliseconds
          const phaseProgress = Math.min((time + constantTime + chartOffset - division.time) / phaseDuration, 1);
          return phaseProgress;
        } else {
          return 0;
        }
      })();
      return division.arrows
        .filter((arrow) => (arrow.type === "freeze" ? arrow.end_time : division.time) > time + chartOffset - 0.3)
        .map((arrow) => {
          const startYOffset =
            bpmIsFixed ?
              ((division.time * fixedBPM / 240 * 192) - initialNoteOfs) * arrowOffsetScale :
              (division.offset - initialNoteOfs) * arrowOffsetScale;
          if (arrow.type === "freeze") {
            const length =
              bpmIsFixed ?
                ((arrow.end_time - division.time) * fixedBPM / 240 * 192) * arrowOffsetScale :
                (arrow.end - division.offset) * arrowOffsetScale;
            return (
              <FreezeArrow dir={rotate(arrow.direction)} offset={startYOffset} length={length} arrowSize={arrowSize} key={`${arrow.direction}-${startYOffset}`} yMultiplier={yMultiplier} opacity={opacity}/>
            );
          } else if (arrow.type === "mine") {
            return <Mine playing={playing} dir={rotate(arrow.direction)} offset={startYOffset} arrowSize={arrowSize} key={`${arrow.direction}-${startYOffset}`} noteTextures={noteTextures} yMultiplier={yMultiplier} opacity={opacity}/>;
          } else {
            return (
              <Arrow freeze={hasFreeze} playing={playing} dir={rotate(arrow.direction)} color={division.color} offset={startYOffset} arrowSize={arrowSize} key={`${arrow.direction}-${startYOffset}`} noteTextures={noteTextures} yMultiplier={yMultiplier} opacity={opacity}/>
            );
          }
        });
    })
    .flat();
  return <Container>{arrows}</Container>;
};

// timeは秒
function getScrollY(time: number, gimmicks: TimingInfo[], highSpeed: number, fixedBPM: number, bpmIsFixed: boolean): number {
  if (bpmIsFixed) {
    return (-1) * fixedBPM * time / 60 * arrowSize;
  } else {
    const division = getDivision(time, gimmicks);
    const divisionLen = arrowSize * 4 * highSpeed;
    return (-1) * division * divisionLen;
  }
}

function getPassedArrows(time: number, sortedArrowTimes: number[]): number {
  const index = sortedArrowTimes.findIndex((t) => t > time);
  return index === -1 ? sortedArrowTimes.length : index;
}

function getSortedGimmicks(gimmick: Gimmick): TimingInfo[] {
  const soflans: TimingInfo[] = gimmick.soflan.map((s) =>
  ({
    type: 'soflan',
    division: s.division,
    value: s.bpm
  })
  );
  const stops: TimingInfo[] = gimmick.stop.map((s) =>
  ({
    type: 'stop',
    division: s.division,
    value: s.time,
  })
  );
  var ret = soflans.concat(stops);
  ret.sort((a, b) => {
    if (a.division < b.division) return -1;
    else if (a.division > b.division) return 1;
    else if (b.type === 'stop') return 1;
    else return -1;
  });
  // swap first and second elements if first is stop
  if (ret[0].type === 'stop') {
    const tmp = ret[0];
    ret[0] = ret[1];
    ret[1] = tmp;
  }
  return ret;
}

function getBPM(division: number, gimmicks: TimingInfo[]): number {
  if (gimmicks.length === 1) return gimmicks[0].value;
  if (gimmicks[1].division > division) return gimmicks[0].value;
  else return getBPM(division, gimmicks.slice(1));
}

type WindowProps = { canvas: JSX.Element; canvasMetaInfo: JSX.Element; playing: boolean; gimmicks: TimingInfo[], chartOffset: number; clap: any, metronome: any, highSpeed: number, audio: HTMLAudioElement, setScrollValue: (val: number) => void, setBPM: (bpm: number) => void, fixedBPM: number, disableGimmick: boolean, sortedArrowTimes: number[] };
const Window = ({ canvas, canvasMetaInfo, playing, gimmicks, chartOffset, clap, metronome, highSpeed, audio, setScrollValue, setBPM, fixedBPM, disableGimmick, sortedArrowTimes }: WindowProps) => {
  const [time, setTime] = useState(0);
  useTick((_delta) => {
    const newTime = audio.currentTime
    const prevTime = time
    setTime(newTime);
    if (clap.volume !== 0) {
      const prevArrows = getPassedArrows(prevTime + chartOffset + 0.08, sortedArrowTimes);
      const currentArrows = getPassedArrows(newTime + chartOffset + 0.08, sortedArrowTimes);
      if (playing && prevArrows < currentArrows) {
        clap.currentTime = 0;
        clap.play();
      }
    }
    const currentDivision = getDivision(newTime + chartOffset + 0.08, gimmicks);
    if (metronome.volume !== 0) {
      const prevDivision = getDivision(prevTime + chartOffset + 0.08, gimmicks);
      if (playing && Math.floor(prevDivision * 4) < Math.floor(currentDivision * 4)) {
        metronome.currentTime = 0;
        metronome.play();
      }
    }
    const newVal = audio.currentTime === 0 ? 100 : Math.ceil(100 - audio.currentTime / audio.duration * 100)
    setBPM(getBPM(currentDivision, gimmicks.filter(g => g.type === 'soflan')));
    setScrollValue(newVal)
  });
  return (
    <Container>
      {disableGimmick ? <></> : <Container key={0} position={[0, getScrollY(time + chartOffset, gimmicks, highSpeed, fixedBPM, disableGimmick)]}>{canvasMetaInfo}</Container>}
      <Container key={1} position={[canvasLeftSpace, getScrollY(time + chartOffset, gimmicks, highSpeed, fixedBPM, disableGimmick)]}>{canvas}</Container>
    </Container>
  )
};

type HighSpeedAreaProps = {
  highSpeed: number, setHighSpeed: (highSpeed: number) => void,
  fixedBPM: number, setFixedBPM: (bpm: number) => void,
  highSpeedMode: HighSpeedMode, setHighSpeedMode: (mode: HighSpeedMode) => void,
  constantTime: number, setConstantTime: (time: number) => void
};
const HighSpeedArea = ({ highSpeed, setHighSpeed, fixedBPM, setFixedBPM, highSpeedMode, setHighSpeedMode, constantTime, setConstantTime }: HighSpeedAreaProps) => {
  const handleBPMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFixedBPM(parseInt(e.target.value));
  };
  const handleConstantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConstantTime(parseInt(e.target.value));
  };
  return (
    <div>
      <HighSpeedModeSelect value={highSpeedMode} setValue={setHighSpeedMode} />
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <IconButton onClick={() => { if (highSpeed > 0.25) setHighSpeed(highSpeed - 0.25) }}>
          <ArrowLeftIcon />
        </IconButton>
        <div>x {highSpeed.toFixed(2)}</div>
        <IconButton onClick={() => { setHighSpeed(highSpeed + 0.25) }}>
          <ArrowRightIcon />
        </IconButton>
      </Grid>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <TextField disabled={highSpeedMode === "ordinal"} id="fixed-BPM" label="BPM" type="number" variant="standard"
          onChange={handleBPMChange} value={fixedBPM}
        />
      </Grid>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <TextField id="constant-time" label="CONSTANT" type="number" variant="standard"
          onChange={handleConstantChange} value={constantTime}
        />
      </Grid>
    </div>
  )
}

const StepZone = () => {
  return (
    <Container>
      <Sprite image={`/skin/left_stepzone.png`} x={canvasLeftSpace} y={0} height={arrowSize} width={arrowSize} />
      <Sprite image={`/skin/down_stepzone.png`} x={canvasLeftSpace + arrowSize} y={0} height={arrowSize} width={arrowSize} />
      <Sprite image={`/skin/up_stepzone.png`} x={canvasLeftSpace + arrowSize * 2} y={0} height={arrowSize} width={arrowSize} />
      <Sprite image={`/skin/right_stepzone.png`} x={canvasLeftSpace + arrowSize * 3} y={0} height={arrowSize} width={arrowSize} />
    </Container>
  )
}

type PlayerProps = { canvas: JSX.Element; canvasMetaInfo: JSX.Element; playing: boolean; setPlaying: (playing: boolean) => void; gimmicks: TimingInfo[], chartOffset: number; clap: any, metronome: any, highSpeed: number, audio: any, fixedBPM: number, bpmIsFixed: boolean, sortedArrowTimes: number[], disableGimmick: boolean };
const Player = ({ canvas, canvasMetaInfo, playing, setPlaying, gimmicks, chartOffset, clap, metronome, highSpeed, audio, fixedBPM, bpmIsFixed, sortedArrowTimes, disableGimmick }: PlayerProps) => {
  const [scrollValue, setScrollValue] = useState(100);
  const [bpm, setBPM] = useState(0);
  useEffect(() => {
    console.log("player updated")
  }, []);
  return (
    <Grid container direction="column" columnSpacing={1} justifyContent="center" alignItems="center" width={canvasWidth}>
      {disableGimmick ? `BPM: ${fixedBPM}` : `BPM: ${bpm.toFixed(2)} * ${highSpeed.toFixed(2)} = ${(bpm * highSpeed).toFixed(2)}`}
      <Grid container direction="row" columnSpacing={1} justifyContent="center" alignItems="center">
        <Grid item xs={11} >
          <Stage width={canvasWidth} height={500}>
            <StepZone />
            <Window
              canvas={canvas}
              canvasMetaInfo={canvasMetaInfo}
              audio={audio}
              playing={playing}
              gimmicks={gimmicks}
              chartOffset={chartOffset}
              clap={clap}
              metronome={metronome}
              highSpeed={highSpeed}
              setScrollValue={setScrollValue}
              setBPM={setBPM}
              fixedBPM={fixedBPM}
              disableGimmick={disableGimmick}
              sortedArrowTimes={sortedArrowTimes}
            />
          </Stage>
        </Grid>
        <Grid item xs={1}>
          <Box sx={{ height: 500 }}>
            <ChartSlider audio={audio} scrollValue={scrollValue} setScrollValue={setScrollValue} />
          </Box>
        </Grid>
      </Grid>
      <Grid container direction="row" columnSpacing={1} justifyContent="center" alignItems="center">
        <IconButton onClick={() => {
          if (playing) {
            setPlaying(false);
          } else {
            setPlaying(true);
          }
        }}>
          {playing ? <PauseCircleOutlineRoundedIcon fontSize="large" /> : <PlayCircleOutlineRoundedIcon fontSize="large" />}
        </IconButton>
        <IconButton onClick={() => { audio.currentTime = 0; setPlaying(true); audio.play(); }}>
          <ReplayIcon fontSize="large" />
        </IconButton>
      </Grid>
    </Grid>
  )
}

type ChartSlicerProps = { audio: HTMLAudioElement, scrollValue: number, setScrollValue: (scrollValue: number) => void };
const ChartSlider = ({ audio, scrollValue, setScrollValue }: ChartSlicerProps) => {
  const handleChange = (event: Event, newValue: any) => {
    console.log("ChartSlider:", scrollValue)
    setScrollValue(newValue);
    audio.currentTime = audio.duration * (100 - newValue) / 100;
  }
  return <Slider aria-label="Chart" orientation="vertical" value={scrollValue} onChange={handleChange} />
}

type HighSpeedModeSelectProps = { value: HighSpeedMode, setValue: (value: HighSpeedMode) => void };
const HighSpeedModeSelect = ({ value, setValue }: HighSpeedModeSelectProps) => {
  const handler = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    switch (value) {
      case "ordinal":
        setValue("ordinal");
        break;
      case "bpm":
        setValue("bpm");
        break;
      case "fixed":
        setValue("fixed");
        break;
      default:
        break;
    }
  }
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">high speed option</FormLabel>
      <RadioGroup
        aria-label="highSpeed"
        defaultValue={value}
        name="highspeed-mode"
        onChange={handler}
      >
        <FormControlLabel value="ordinal" control={<Radio />} label="ordinal" />
        <FormControlLabel value="bpm" control={<Radio />} label="fixed BPM" />
        <FormControlLabel value="fixed" control={<Radio />} label="fixed, no gimmick" />
      </RadioGroup>
    </FormControl>
  );
}

type GimmickViewerSelectProps = { value: GimmickViewer, setValue: (value: GimmickViewer) => void };
const GimmickViewerSelect = ({ value, setValue }: GimmickViewerSelectProps) => {
  const handler = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    // 来うるvalueは絶対にGimmickViewerのどれかだが、それをコンパイラに教える術を知らない
    switch (value) {
      case "detail":
        setValue("detail");
        break;
      case "icon":
        setValue("icon");
        break;
      case "off":
        setValue("off");
        break;
      default:
        break;
    }
  }
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">display gimmick</FormLabel>
      <RadioGroup
        aria-label="gimmick"
        defaultValue={value}
        name="gimmick-display-type"
        onChange={handler}
      >
        <FormControlLabel value="detail" control={<Radio />} label="Detail" />
        <FormControlLabel value="icon" control={<Radio />} label="Icon" />
        <FormControlLabel value="off" control={<Radio />} label="Don't show" />
      </RadioGroup>
    </FormControl>
  );
}

type RotationModeSelectProps = { value: RotationMode, setValue: (value: RotationMode) => void };
const RotationModeSelect = ({ value, setValue }: RotationModeSelectProps) => {
  const handler = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    // 来うるvalueは絶対にGimmickViewerのどれかだが、それをコンパイラに教える術を知らない
    switch (value) {
      case "off":
        setValue("off");
        break;
      case "mirror":
        setValue("mirror");
        break;
      case "left":
        setValue("left");
        break;
      case "right":
        setValue("right");
        break;
      default:
        break;
    }
  }
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">rotation option</FormLabel>
      <RadioGroup
        aria-label="rotation"
        defaultValue={value}
        name="rotation-mode"
        onChange={handler}
      >
        <FormControlLabel value="off" control={<Radio />} label="OFF" />
        <FormControlLabel value="mirror" control={<Radio />} label="MIRROR" />
        <FormControlLabel value="left" control={<Radio />} label="LEFT" />
        <FormControlLabel value="right" control={<Radio />} label="RIGHT" />
      </RadioGroup>
    </FormControl>
  );
}

type PlaySpeedAreaProps = { audio: HTMLAudioElement };
const PlaySpeedArea = ({ audio }: PlaySpeedAreaProps) => {
  const [playSpeed, setPlaySpeed] = useState(1.0);
  useEffect(() => {
    audio.playbackRate = playSpeed
  }, [audio]);
  return (
    <Grid container direction="row" justifyContent="center" alignItems="center">
      <div>Play Speed: {playSpeed.toFixed(2)}</div>
      <IconButton onClick={() => {
        if (playSpeed > 0.1) {
          let newPlaySpeed = playSpeed - 0.1;
          setPlaySpeed(newPlaySpeed);
          audio.playbackRate = newPlaySpeed
        }
      }}>
        <RemoveIcon />
      </IconButton>
      <IconButton onClick={() => {
        let newPlaySpeed = playSpeed + 0.1;
        setPlaySpeed(newPlaySpeed)
        audio.playbackRate = newPlaySpeed
      }}>
        <AddIcon />
      </IconButton>
    </Grid>
  )
}

type SettingAreaProps = {
  highSpeedMode: HighSpeedMode,
  setHighSpeedMode: (val: HighSpeedMode) => void,
  rotationMode: RotationMode,
  setRotationMode: (val: RotationMode) => void,
  gimmickViewer: GimmickViewer,
  setGimmickViewer: (val: GimmickViewer) => void,
  highSpeed: number,
  setHighSpeed: (highSpeed: number) => void,
  audio: HTMLAudioElement,
  clap: HTMLAudioElement,
  metronome: HTMLAudioElement,
  fixedBPM: number,
  setFixedBPM: (fixedBPM: number) => void,
  constantTime: number,
  setConstantTime: (constantTime: number) => void,
};
const SettingArea = ({ highSpeedMode, setHighSpeedMode, rotationMode, setRotationMode, gimmickViewer, setGimmickViewer, highSpeed, setHighSpeed, audio, clap, metronome, fixedBPM, setFixedBPM, constantTime, setConstantTime }: SettingAreaProps) => {
  return (
    <Grid container direction="column" spacing={2} >
      <Card variant="outlined">
        <CardContent>
          <HighSpeedArea highSpeed={highSpeed} setHighSpeed={setHighSpeed} fixedBPM={fixedBPM} setFixedBPM={setFixedBPM} highSpeedMode={highSpeedMode} setHighSpeedMode={setHighSpeedMode} constantTime={constantTime} setConstantTime={setConstantTime} />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <PlaySpeedArea audio={audio} />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Grid container direction="column" columnSpacing={1} >
            <Grid container direction="row" columnSpacing={1} >
              <Grid item xs={3}>
                audio:
              </Grid>
              <Grid item xs={3}>
                <VolumeControl audio={audio} name="audio"/>
              </Grid>
            </Grid>
            <Grid container direction="row" columnSpacing={1}>
              <Grid item xs={3}>
                clap:
              </Grid>
              <Grid item xs={3}>
                <VolumeControl audio={clap} name="clap"/>
              </Grid>
            </Grid>
            <Grid container direction="row" columnSpacing={1}>
              <Grid item xs={3}>
                beat:
              </Grid>
              <Grid item xs={3}>
                <VolumeControl audio={metronome} name="metronome"/>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Grid container direction="row" columnSpacing={1} >
        <Card variant="outlined">
          <CardContent>
            <GimmickViewerSelect value={gimmickViewer} setValue={setGimmickViewer} />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <RotationModeSelect value={rotationMode} setValue={setRotationMode} />
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  )
}

// TODO: 引数を減らす
type ChartAreaProps = { chartContent:ChartContent; audio: HTMLAudioElement; clap: HTMLAudioElement; metronome: HTMLAudioElement; playing: boolean; setPlaying: (playing: boolean) => void; };
const ChartArea = ({ chartContent, audio, clap, metronome, playing, setPlaying }: ChartAreaProps) => {
  //const [bpmIsFixed, setBPMIsFixed] = useState(false);
  const stream = chartContent.stream;
  const gimmick = chartContent.stream.gimmick;
  const song = chartContent.song;
  const chartOffset = song.music.offset;
  const highestBPM = parseInt((song.bpm.split('-')[1] || song.bpm.split('-')[0]), 10)
  const [gimmickViewer, setGimmickViewer] = usePersist("gimmickViewer", "icon");
  const [rotationMode, setRotationMode] = usePersist("rotationMode","off");
  const [highSpeedMode, setHighSpeedMode] = usePersist("highSpeedMode", "ordinal");
  const [fixedBPM, setFixedBPM] = usePersist("fixedBPM", 550);
  const [constantTime, setConstantTime] = usePersist("constantTime", 800);
  const [highSpeed, setHighSpeed] = usePersist("highSpeed", 1.0);
  const sortedTimingInfo = getSortedGimmicks(gimmick)
  const effectiveHighSpeed = highSpeedMode === "bpm" ? fixedBPM / highestBPM : highSpeed
  const canvas = <Canvas rotationMode={rotationMode} playing={playing} stream={stream} highSpeed={effectiveHighSpeed} fixedBPM={fixedBPM} bpmIsFixed={highSpeedMode === "fixed"} audio={audio} constantTime={constantTime/1000 + 0.2} chartOffset={chartOffset}/>;
  const canvasMetaInfo = <CanvasMetaInfo stream={stream} highSpeed={effectiveHighSpeed} gimmick={gimmick} gimmickViewer={gimmickViewer} />;
  const [sortedArrowTimes, setSortedArrowTimes] = useState<number[]>([]);
  useEffect(() => {
    const arrowStream = stream.stream.filter(division => division.arrows.some((arrow) => arrow.type !== "mine"));
    setSortedArrowTimes(arrowStream.map(arrows => arrows.time));
  }, [stream, audio]);
  useEffect(() => {
    console.log("chart area updated");
  }, []);
  return (
    <Grid container direction="row" spacing={2}>
      <Grid item width={canvasWidth + 80}>
        <Player
          canvas={canvas}
          canvasMetaInfo={canvasMetaInfo}
          audio={audio}
          playing={playing}
          gimmicks={sortedTimingInfo}
          chartOffset={chartOffset}
          clap={clap}
          metronome={metronome}
          highSpeed={effectiveHighSpeed}
          setPlaying={setPlaying}
          fixedBPM={fixedBPM}
          bpmIsFixed={highSpeedMode !== "ordinal"}
          disableGimmick={highSpeedMode === "fixed"}
          sortedArrowTimes={sortedArrowTimes}
        />
      </Grid>
      <Grid item >
        <SettingArea
          rotationMode={rotationMode}
          setRotationMode={setRotationMode}
          gimmickViewer={gimmickViewer}
          setGimmickViewer={setGimmickViewer}
          highSpeed={highSpeed}
          setHighSpeed={setHighSpeed}
          audio={audio}
          clap={clap}
          metronome={metronome}
          fixedBPM={fixedBPM}
          setFixedBPM={setFixedBPM}
          highSpeedMode={highSpeedMode}
          setHighSpeedMode={setHighSpeedMode}
          constantTime={constantTime}
          setConstantTime={setConstantTime}
        />
      </Grid>
    </Grid>
  );
};

export default ChartArea;
