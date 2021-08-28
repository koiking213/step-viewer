import React, { useState } from "react";
import {
  Stage,
  Container,
  Sprite,
  useTick,
  Text,
} from "@inlet/react-pixi";
import { settings, SCALE_MODES } from "pixi.js";
import { Stream, Gimmick, Stop, Soflan } from "../types/index";
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


import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

settings.SCALE_MODE = SCALE_MODES.NEAREST;


const arrowSize = 32;
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
        const source = faster ? "/speed_up.png" : "/speed_down.png";
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
        return <Sprite image={"/stop.png"} x={canvasLeftSpace + arrowSize * 4 + 10 + 32} y={y} height={32} width={32} key={`stopicon-${y}`} />
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
  // なんでかエラーになる
  //const soflan = () => {
  //  switch (gimmickViewer) {
  //    case "detail": return (<SoflanDetail soflans={gimmick.soflan} highSpeed={highSpeed} />);
  //    case "icon": return (<SoflanIcon soflans={gimmick.soflan} highSpeed={highSpeed} />);
  //    case "off": return (<></>);
  //  }
  //}
  //const stop = () => {
  //  switch (gimmickViewer) {
  //    case "detail": return <StopDetail stops={gimmick.stop} highSpeed={highSpeed} />
  //    case "icon": return <StopIcon stops={gimmick.stop} highSpeed={highSpeed} />
  //    case "off": return <></>
  //  }
  //}
  const soflan = gimmickViewer === "detail" ? <SoflanDetail soflans={gimmick.soflan} highSpeed={highSpeed} /> : (
    gimmickViewer === "icon" ? <SoflanIcon soflans={gimmick.soflan} highSpeed={highSpeed} /> : <></>);
  const stop = gimmickViewer === "detail" ? <StopDetail stops={gimmick.stop} highSpeed={highSpeed} /> : (
    gimmickViewer === "icon" ? <StopIcon stops={gimmick.stop} highSpeed={highSpeed} /> : <></>);
  return (
    <Container>
      {divisionLines}
      {soflan}
      {stop}
    </Container>
  );
}

type CanvasProps = { stream: Stream, highSpeed: number };
const Canvas = ({ stream, highSpeed }: CanvasProps) => {
  useEffect(() => {
    console.log("canvas updated");
  }, []);
  const arrowOffsetScale = arrowSize * highSpeed * arrowPosEpsilon;
  const initialNoteOfs = 0
  const arrows = stream.stream
    .map((division) => {
      return division.arrows.map((arrow) => {
        const startY = (division.offset - initialNoteOfs) * arrowOffsetScale;
        if (arrow.type === "freeze") {
          const length = (arrow.end - division.offset) * arrowOffsetScale;
          return (
            <FreezeArrow dir={arrow.direction} y={startY} length={length} arrowSize={arrowSize} key={`${arrow.direction}-${startY}`}/>
          );
        } else if (arrow.type === "mine") {
          return <Mine dir={arrow.direction} y={startY} arrowSize={arrowSize} key={`${arrow.direction}-${startY}`}/>;
        } else {
          return (
            <Arrow dir={arrow.direction} color={division.color} y={startY} arrowSize={arrowSize} key={`${arrow.direction}-${startY}`}/>
          );
        }
      });
    })
    .flat();
  return <Container>{arrows}</Container>;
};

type TimingInfo = {
  type: string;
  division: number;
  value: number;
};

// todo: 流石にもうちょっと簡潔に書けるはず
// bpm120, 1divに2sかかる -> 1divにかかるtime = 4/(bpm/60)
// bps = bpm/60
// d/s = bpm/240
// time = div*240/bpm
// div = time*bpm/240
function getTimeFromDiv(division: number, bpm: number) {
  return division * 240 / bpm
}
function getDivFromTime(time: number, bpm: number) {
  return time * bpm / 240
}
// timeは秒
function getDivisionRecur(time: number, doneTime: number, gimmicks: TimingInfo[], y: number, bpm: number): number {
  const newDivision = y + getDivFromTime((time - doneTime), bpm)
  if (gimmicks.length === 0) {
    return newDivision
  }
  const gimmick = gimmicks[0]
  if (newDivision < gimmick.division) {
    return newDivision
  }

  // ここに来る時点でgimmickの影響は受ける
  if (gimmick.type === "stop") {
    doneTime += getTimeFromDiv((gimmick.division - y), bpm) // stopに至るまでに必要な時間
    doneTime += gimmick.value // stopで消費される時間
    if (time < doneTime) { // stopの最中
      return gimmick.division
    } else {
      return getDivisionRecur(time, doneTime, gimmicks.slice(1), gimmick.division, bpm)
    }
  } else { // soflan
    doneTime += getTimeFromDiv((gimmick.division - y), bpm)
    return getDivisionRecur(time, doneTime, gimmicks.slice(1), gimmick.division, gimmick.value)
  }
}

// timeは秒
function getDivision(time: number, gimmicks: TimingInfo[]): number {
  // todo: 最初がstopだとバグる
  const bpm = gimmicks[0].value
  const ret = getDivisionRecur(time, 0, gimmicks.slice(1), 0, bpm)
  return ret
}

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
        <Button variant="contained" onClick={() => { setHighSpeed(highSpeed - 0.25) }}>-</Button>
        <div>High Speed: {highSpeed.toFixed(2)}</div>
        <Button variant="contained" onClick={() => { setHighSpeed(highSpeed + 0.25) }}>+</Button>
      </Grid>
    </div>
  )
}

const StepZone = () => {
  return (
    <Container>
      <Sprite image={`/left_stepzone.png`} x={canvasLeftSpace} y={0} height={arrowSize} width={arrowSize} />
      <Sprite image={`/down_stepzone.png`} x={canvasLeftSpace + arrowSize} y={0} height={arrowSize} width={arrowSize} />
      <Sprite image={`/up_stepzone.png`} x={canvasLeftSpace + arrowSize * 2} y={0} height={arrowSize} width={arrowSize} />
      <Sprite image={`/right_stepzone.png`} x={canvasLeftSpace + arrowSize * 3} y={0} height={arrowSize} width={arrowSize} />
    </Container>
  )
}

type PlayerProps = { canvas: JSX.Element; canvasMetaInfo: JSX.Element; playing: boolean; gimmicks: TimingInfo[], chartOffset: number; clap: any, metronome: any, stream: Stream, highSpeed: number, audio: any };
const Player = ({ canvas, canvasMetaInfo, playing, gimmicks, chartOffset, clap, metronome, stream, highSpeed, audio }: PlayerProps) => {
  const [scrollValue, setScrollValue] = useState(100);
  return (
    <Grid container direction="row" columnSpacing={1} justifyContent="center" alignItems="center">
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
      <Box sx={{ height: 500 }}>
        <ChartSlider audio={audio} scrollValue={scrollValue} setScrollValue={setScrollValue} />
      </Box>
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
    <div>
      <HighSpeedArea highSpeed={highSpeed} setHighSpeed={setHighSpeed} />
      <Grid container direction="row" columnSpacing={1} justifyContent="center" alignItems="center">
        <IconButton onClick={() => {
          if (playing) {
            setPlaying(false); audio.pause();
          } else {
            setPlaying(true); audio.play();
          }
        }}>
          {playing ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton onClick={() => { audio.currentTime = 0; }}>
          <ReplayIcon />
        </IconButton>
      </Grid>
      <Grid container direction="column" columnSpacing={1} justifyContent="center" alignItems="center">
        <Grid container direction="row" columnSpacing={1} justifyContent="center" alignItems="center">
          <Grid item xs={3}>
            audio:
          </Grid>
          <Grid item xs={3}>
            <VolumeControl audio={audio} />
          </Grid>
        </Grid>
        <Grid container direction="row" columnSpacing={1} justifyContent="center" alignItems="center">
          <Grid item xs={3}>
            hand clap:
          </Grid>
          <Grid item xs={3}>
            <VolumeControl audio={clap} />
          </Grid>
        </Grid>
        <Grid container direction="row" columnSpacing={1} justifyContent="center" alignItems="center">
          <Grid item xs={3}>
            metronome:
          </Grid>
          <Grid item xs={3}>
            <VolumeControl audio={metronome} />
          </Grid>
        </Grid>
      </Grid>
      <GimmickViewerSelect setValue={setGimmickViewer} />
    </div>
  )
}

type ChartAreaProps = { stream: Stream; gimmick: Gimmick; audio: any; chartOffset: number };
const ChartArea = ({ stream, gimmick, audio, chartOffset }: ChartAreaProps) => {
  const [gimmickViewer, setGimmickViewer] = useState<GimmickViewer>("icon");
  const [highSpeed, setHighSpeed] = useState(1.0);
  const sortedTimingInfo = getSortedGimmicks(gimmick)
  const key = JSON.stringify(stream) + highSpeed.toString();
  const canvas = <Canvas stream={stream} highSpeed={highSpeed} key={key} />;
  const canvasMetaInfo = <CanvasMetaInfo stream={stream} highSpeed={highSpeed} gimmick={gimmick} gimmickViewer={gimmickViewer} key={key + gimmickViewer} />;
  const [playing, setPlaying] = useState(false);
  const clap = new Audio('/Clap-1.wav');
  const metronome = new Audio('/metronome.ogg');
  useEffect(() => {
    console.log("chart area updated");
  }, []);
  return (
    <Grid container direction="row" alignItems="center" justifyContent="center">
      <Grid item xs={3}>
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
