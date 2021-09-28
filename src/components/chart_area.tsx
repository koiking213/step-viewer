import React, { useState } from "react";
import {
  Stage,
  Container,
  Sprite,
  AnimatedSprite,
  useTick,
  Text,
} from "@inlet/react-pixi";
import { settings, SCALE_MODES, Texture, BaseTexture, Rectangle } from "pixi.js";
import { Stream, Gimmick, Stop, Soflan, TimingInfo } from "../types/index";
import { useEffect } from "react";
import { Arrow, Mine, FreezeArrow } from "./chart_area/notes";
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReplayIcon from '@material-ui/icons/Replay';
import PauseIcon from '@material-ui/icons/Pause';
import { VolumeControl } from './volume_control';
import { DivisionLine } from './chart_area/division_line'
import { Slider } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
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
import ButtonGroup from "@mui/material/ButtonGroup";

settings.SCALE_MODE = SCALE_MODES.NEAREST;


const arrowSize = 64;
const canvasLeftSpace = 30;
const canvasRightSpace = 80;
const canvasWidth = arrowSize * 4 + canvasLeftSpace + canvasRightSpace;
const arrowPosEpsilon = 1 / 192 * 4;

type GimmickViewer = "detail" | "icon" | "off"

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
  useEffect(() => {
    console.log("gimmickViewer:", gimmickViewer);
  }, [gimmickViewer]);
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
  ["red", "blue", "yellow", "green"].map(color => {
    ["left", "down", "up", "right"].map(direction => {
      // TODO: directionとcolorはtypesから取るようにする
      const y = color === "red" ? 0 : color === "blue" ? 64 : color === "yellow" ? 128 : 192;
      dict[`${direction}_${color}`] = Array.from(Array(8), (v, k) =>
        new Texture(new BaseTexture(`/skin/arrows.png`), new Rectangle(k * 64, y, 64, 64))
      )
    })
  });
  ["left", "down", "up", "right"].map(direction => {
    dict[`${direction}_mine`] = Array.from(Array(8), (v, k) =>
      new Texture(new BaseTexture(`/skin/${direction}_mine.png`), new Rectangle(k * 64, 0, 64, 64))
    )
  })
  return dict;
}

type CanvasProps = { stream: Stream, highSpeed: number, playing: boolean };
const Canvas = ({ stream, highSpeed, playing }: CanvasProps) => {
  useEffect(() => {
    console.log("canvas updated");
  }, []);
  const arrowOffsetScale = arrowSize * highSpeed * arrowPosEpsilon;
  const initialNoteOfs = 0
  const noteTextures = getNoteTextures();
  const arrows = stream.stream
    .map((division) => {
      return division.arrows.map((arrow) => {
        const startY = (division.offset - initialNoteOfs) * arrowOffsetScale;
        if (arrow.type === "freeze") {
          const length = (arrow.end - division.offset) * arrowOffsetScale;
          return (
            <FreezeArrow dir={arrow.direction} y={startY} length={length} arrowSize={arrowSize} key={`${arrow.direction}-${startY}`} />
          );
        } else if (arrow.type === "mine") {
          return <Mine playing={playing} dir={arrow.direction} y={startY} arrowSize={arrowSize} key={`${arrow.direction}-${startY}`} noteTextures={noteTextures} />;
        } else {
          return (
            <Arrow playing={playing} dir={arrow.direction} color={division.color} y={startY} arrowSize={arrowSize} key={`${arrow.direction}-${startY}`} noteTextures={noteTextures} />
          );
        }
      });
    })
    .flat();
  return <Container>{arrows}</Container>;
};

// timeは秒
function getScrollY(time: number, gimmicks: TimingInfo[], highSpeed: number): number {
  const division = getDivision(time, gimmicks);
  const divisionLen = arrowSize * 4 * highSpeed;
  return (-1) * division * divisionLen;
}

function getPassedArrows(passedDivision: number, stream: Stream): number {
  return stream.stream.filter(division => division.offset / 192 <= passedDivision).length
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
  return ret;
}

type WindowProps = { canvas: JSX.Element; canvasMetaInfo: JSX.Element; playing: boolean; gimmicks: TimingInfo[], chartOffset: number; clap: any, metronome: any, stream: Stream, highSpeed: number, audio: HTMLAudioElement, setScrollValue: (val: number) => void };
const Window = ({ canvas, canvasMetaInfo, playing, gimmicks, chartOffset, clap, metronome, stream, highSpeed, audio, setScrollValue }: WindowProps) => {
  const [time, setTime] = useState(0);
  useTick((delta) => {

    const newTime = audio.currentTime
    const prevDivision = getDivision(time + chartOffset + 0.08, gimmicks);
    const prevArrows = getPassedArrows(prevDivision, stream);
    setTime(newTime);
    const currentDivision = getDivision(newTime + chartOffset + 0.08, gimmicks);
    const currentArrows = getPassedArrows(currentDivision, stream);
    if (playing && prevArrows < currentArrows) {
      clap.currentTime = 0;
      clap.play();
    }
    if (playing && Math.floor(prevDivision * 4) < Math.floor(currentDivision * 4)) {
      metronome.currentTime = 0;
      metronome.play();
    }
    // なんか結果的にこれでaudio.currentTimeがNaNの場合も吸収するけど流石にこのままは良くないのでNaNとかしたい
    const newVal = audio.currentTime === 0 ? 100 : Math.ceil(100 - audio.currentTime / audio.duration * 100)
    setScrollValue(newVal)
  });
  return (
    <Container>
      <Container key={0} position={[0, getScrollY(time + chartOffset, gimmicks, highSpeed)]}>{canvasMetaInfo}</Container>
      <Container key={1} position={[canvasLeftSpace, getScrollY(time + chartOffset, gimmicks, highSpeed)]}>{canvas}</Container>
    </Container>
  )
};

type HighSpeedAreaProps = { highSpeed: number, setHighSpeed: (highSpeed: number) => void };
const HighSpeedArea = ({ highSpeed, setHighSpeed }: HighSpeedAreaProps) => {
  return (
    <div>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <div>High Speed: {highSpeed.toFixed(2)}</div>
        <IconButton onClick={() => { setHighSpeed(highSpeed - 0.25) }}>
          <RemoveIcon />
        </IconButton>
        <IconButton onClick={() => { setHighSpeed(highSpeed + 0.25) }}>
          <AddIcon />
        </IconButton>
      </Grid>
    </div>
  )
}

const StepZone = () => {
  const noteTextures = getNoteTextures();
  return (
    <Container>
      <Sprite image={`/skin/left_stepzone.png`} x={canvasLeftSpace} y={0} height={arrowSize} width={arrowSize} />
      <Sprite image={`/skin/down_stepzone.png`} x={canvasLeftSpace + arrowSize} y={0} height={arrowSize} width={arrowSize} />
      <Sprite image={`/skin/up_stepzone.png`} x={canvasLeftSpace + arrowSize * 2} y={0} height={arrowSize} width={arrowSize} />
      <Sprite image={`/skin/right_stepzone.png`} x={canvasLeftSpace + arrowSize * 3} y={0} height={arrowSize} width={arrowSize} />
    </Container>
  )
}

// TODO: Playerが再生/停止ボタンも持つべき?
type PlayerProps = { canvas: JSX.Element; canvasMetaInfo: JSX.Element; playing: boolean; setPlaying: (playing: boolean) => void; gimmicks: TimingInfo[], chartOffset: number; clap: any, metronome: any, stream: Stream, highSpeed: number, audio: any };
const Player = ({ canvas, canvasMetaInfo, playing, setPlaying, gimmicks, chartOffset, clap, metronome, stream, highSpeed, audio }: PlayerProps) => {
  const [scrollValue, setScrollValue] = useState(100);
  useEffect(() => {
    if (scrollValue === 0) {
      setPlaying(false);
    }
  }, [scrollValue, setPlaying]);
  return (
    <Grid container direction="column" columnSpacing={1} justifyContent="center" alignItems="center">
      <Grid container direction="row" columnSpacing={1} justifyContent="center" alignItems="center">
        <Grid item xs={8}>
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
              stream={stream}
              highSpeed={highSpeed}
              setScrollValue={setScrollValue}
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
            setPlaying(false); audio.pause();
          } else {
            setPlaying(true); audio.play();
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

type GimmickViewerSelectProps = { setValue: (value: GimmickViewer) => void };
const GimmickViewerSelect = ({ setValue }: GimmickViewerSelectProps) => {
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
        defaultValue="icon"
        name="radio-buttons-group"
        onChange={handler}
      >
        <FormControlLabel value="detail" control={<Radio />} label="Detail" />
        <FormControlLabel value="icon" control={<Radio />} label="Icon" />
        <FormControlLabel value="off" control={<Radio />} label="Don't show" />
      </RadioGroup>
    </FormControl>
  );
}

type SettingAreaProps = { setGimmickViewer: (val: GimmickViewer) => void, highSpeed: number, setHighSpeed: (highSpeed: number) => void, audio: HTMLAudioElement, clap: HTMLAudioElement, metronome: HTMLAudioElement, playing: boolean, setPlaying: (playing: boolean) => void };
const SettingArea = ({ setGimmickViewer, highSpeed, setHighSpeed, audio, clap, metronome, playing, setPlaying }: SettingAreaProps) => {
  return (
    <Grid container direction="column" spacing={2} >
      <Card variant="outlined">
        <CardContent>
          <HighSpeedArea highSpeed={highSpeed} setHighSpeed={setHighSpeed} />
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
                <VolumeControl audio={audio} />
              </Grid>
            </Grid>
            <Grid container direction="row" columnSpacing={1}>
              <Grid item xs={3}>
                hand clap:
              </Grid>
              <Grid item xs={3}>
                <VolumeControl audio={clap} />
              </Grid>
            </Grid>
            <Grid container direction="row" columnSpacing={1}>
              <Grid item xs={3}>
                metronome:
              </Grid>
              <Grid item xs={3}>
                <VolumeControl audio={metronome} />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <GimmickViewerSelect setValue={setGimmickViewer} />
        </CardContent>
      </Card>

    </Grid>
  )
}

type ChartAreaProps = { stream: Stream; gimmick: Gimmick; audio: any; chartOffset: number };
const ChartArea = ({ stream, gimmick, audio, chartOffset }: ChartAreaProps) => {
  const [gimmickViewer, setGimmickViewer] = useState<GimmickViewer>("icon");
  const [highSpeed, setHighSpeed] = useState(1.0);
  const [playing, setPlaying] = useState(false);
  const sortedTimingInfo = getSortedGimmicks(gimmick)
  const key = JSON.stringify(stream) + highSpeed.toString();
  const canvas = <Canvas playing={playing} stream={stream} highSpeed={highSpeed} key={key} />;
  const canvasMetaInfo = <CanvasMetaInfo stream={stream} highSpeed={highSpeed} gimmick={gimmick} gimmickViewer={gimmickViewer} key={key + gimmickViewer} />;
  const clap = new Audio('/Clap-1.wav');
  const metronome = new Audio('/metronome.ogg');
  useEffect(() => {
    console.log("chart area updated");
  }, []);
  useEffect(() => {
    setPlaying(false);
  }, [audio]);
  return (
    <Grid container direction="row" alignItems="center" justifyContent="center">
      <Grid item xs={5}>
        <Player
          canvas={canvas}
          canvasMetaInfo={canvasMetaInfo}
          audio={audio}
          playing={playing}
          gimmicks={sortedTimingInfo}
          key={key}
          chartOffset={chartOffset}
          clap={clap}
          metronome={metronome}
          stream={stream}
          highSpeed={highSpeed}
          setPlaying={setPlaying}
        />
      </Grid>
      <Grid item xs={4}>
        <SettingArea
          setGimmickViewer={setGimmickViewer}
          highSpeed={highSpeed}
          setHighSpeed={setHighSpeed}
          audio={audio}
          clap={clap}
          metronome={metronome}
          playing={playing}
          setPlaying={setPlaying}
        />
      </Grid>
    </Grid>
  );
};

export default ChartArea;
