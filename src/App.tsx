import './App.css';

import { Stream, Gimmick, Song, Chart } from './types/index'
import { useEffect, useState } from "react"

import { Dropbox } from 'dropbox'
import ReactLoading from 'react-loading';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid'
import { SongTable } from './components/table'
import ChartArea from './components/chart_area'

const emptySong: Song = {
  title: "",
  dir_name: "",
  charts: [],
  bpm: "",
  music: {
    path: "",
    offset: 0
  },
  banner: ""
}

const emptyChart: Chart = {
  difficulty: "",
  level: 0,
  max_combo: 0,
  stream: 0,
  voltage: 0,
  air: 0,
  freeze: 0,
  chaos: 0
}


function downloadFromDropbox(filepath: string, successCallback: (blob: any) => void) {
  const dbx = new Dropbox({ accessToken: process.env.REACT_APP_DROPBOX_TOKEN });
  dbx.filesDownload({ path: filepath })
    .then((response) => {
      successCallback((response.result as any).fileBlob)
    })
    .catch(function (error: any) {
      console.log(error)
    });
}

function getBanner(filepath: string, setter: (banner: string) => void) {
  downloadFromDropbox(filepath, (blob) => {
    setter(URL.createObjectURL(blob))
  })
}

function getAudio(filepath: string, setter: (audio: HTMLAudioElement) => void, loading: (b: boolean) => void) {
  downloadFromDropbox(filepath, (blob) => {
    const audio = new Audio(URL.createObjectURL(blob))
    setter(audio)
    loading(false)
  })
}

function getGimmick(filepath: string, setter: (gimmick: Gimmick) => void) {
  downloadFromDropbox(filepath, (blob) => {
    blob.text().then((text: string) => {
      const json: Gimmick = JSON.parse(text)
      setter(json)
    })
  })
};

function getSong(filepath: string, setter: (song: Stream) => void) {
  downloadFromDropbox(filepath, (blob) => {
    blob.text().then((text: string) => {
      const json: Stream = JSON.parse(text)
      setter(json)
    })
  })
};

type SongInfoProps = { song: Song, chart: Chart };
const SongInfo = ({ song, chart }: SongInfoProps) => {
  return (song === emptySong) ? <></> : <div>{`${song.title} (${chart.difficulty}) ${chart.level}`}</div>
}

function App() {
  const emptyStream: Stream = JSON.parse('{"stream":[], "cost":-1}');
  const emptyGimmick: Gimmick = JSON.parse('{"soflan":[{"division": 0, "bpm": 120}], "stop":[]}');
  const [stream, setStream] = useState(emptyStream)
  const [gimmick, setGimmick] = useState(emptyGimmick)
  const [audio, setAudio] = useState<HTMLAudioElement>(new Audio('/silence.wav'))
  const [isLoading, setIsLoading] = useState(false)
  const [song, setSong] = useState(emptySong)
  const [chart, setChart] = useState(emptyChart)
  const [clap, setClap] = useState<HTMLAudioElement>(new Audio('/silence.wav'))
  const [metronome, setMetronome] = useState<HTMLAudioElement>(new Audio('/silence.wav'))
  const [songs, setSongs] = useState<Song[]>([])
  const [banner, setBanner] = useState("")

  function setChartInfo(song: Song, chart: Chart): void {
    audio.pause()
    setIsLoading(true)
    getSong(`/${song.dir_name}/${chart.difficulty}.json`, setStream)
    getGimmick(`/${song.dir_name}/gimmick.json`, setGimmick)
    if (song.banner !== "") {
      getBanner(`/${song.dir_name}/${song.banner}`, setBanner)
    } else {
      setBanner("")
    }
    getAudio(`/${song.dir_name}/${song.music.path}`, setAudio, setIsLoading)
    setSong(song)
    setChart(chart)
  }
  useEffect(() => {
    setIsLoading(true)
    getAudio("/Clap-1.wav", setClap, setIsLoading)
    getAudio("/metronome.ogg", setMetronome, setIsLoading)
    downloadFromDropbox("/songs.json", (blob) => {
      blob.text().then((text: string) => {
        const songs: Song[] = JSON.parse(text)
        setSongs(songs)
        setIsLoading(false)
      })
    })
  }, []);
  const Loading = () => isLoading ? <ReactLoading type="spin" color="black" /> : <> </>
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Grid container direction="row" spacing={2}>
          <Grid item >
            <ChartArea stream={stream} gimmick={gimmick} audio={audio} chartOffset={song.music.offset} clap={clap} metronome={metronome} />
          </Grid>
          <Grid item >
            <img src={banner === "" ? "/no_image.png" : banner} width="200" height="200" />
            <Box display="flex" justifyContent="center" m={1}>
              <SongInfo song={song} chart={chart} />
              <Loading />
            </Box>
          </Grid>
        </Grid>
        <SongTable songs={songs} setChartInfo={setChartInfo} />
      </Box>
    </Container>
  );
}

export default App;
