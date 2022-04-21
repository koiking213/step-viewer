import './App.css';

import { Stream, Gimmick, Song, Chart, ChartContent } from './types/index'
import { useEffect, useState, useCallback } from "react"

import { Dropbox } from 'dropbox'
import ReactLoading from 'react-loading';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid'
import { SongTable } from './components/table'
import ChartArea from './components/chart_area'
import { PlayListArea } from './components/playlist'

const emptySong: Song = {
  title: "",
  dir_name: "",
  charts: [],
  bpm: "120",
  music: {
    path: "",
    offset: 0
  },
  banner: "",
  timestamp: "",
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

const dir_prefix = "";

async function downloadFromDropbox(filepath: string) {
  const dbx = new Dropbox({ accessToken: process.env.REACT_APP_DROPBOX_TOKEN });
  const response = await dbx.filesDownload({ path: filepath });
  return (response.result as any).fileBlob;
}

async function getBanner(filepath: string): Promise<string> {
  const blob = await downloadFromDropbox(filepath);
  return URL.createObjectURL(blob);
}

async function getAudio(filepath: string): Promise<HTMLAudioElement> {
  const blob = await downloadFromDropbox(filepath);
  return new Audio(URL.createObjectURL(blob));
}

async function getGimmick(filepath: string): Promise<Gimmick> {
  const blob = await downloadFromDropbox(filepath);
  const text = await blob.text();
  return JSON.parse(text);
};

async function getSong(filepath: string): Promise<Stream> {
  const blob = await downloadFromDropbox(filepath);
  const text = await blob.text();
  return JSON.parse(text);
};

type ChartInfo = { song: Song, chart: Chart };

type SongInfoProps = { song: Song, chart: Chart };
const SongInfo = ({ song, chart }: SongInfoProps) => {
  return (song === emptySong) ? <></> : <div>{`${song.title} (${chart.difficulty}) ${chart.level}`}</div>
}

function App() {
  const emptyStream: Stream = JSON.parse('{"stream":[], "cost":-1}');
  const emptyGimmick: Gimmick = JSON.parse('{"soflan":[{"division": 0, "bpm": 120}], "stop":[]}');
  const [audio, setAudio] = useState<HTMLAudioElement>(new Audio('/silence.wav'))
  const [isLoading, setIsLoading] = useState(false)
  const [song, setSong] = useState(emptySong)
  const [chart, setChart] = useState(emptyChart)
  const [clap, setClap] = useState<HTMLAudioElement>(new Audio('/silence.wav'))
  const [metronome, setMetronome] = useState<HTMLAudioElement>(new Audio('/silence.wav'))
  const [songs, setSongs] = useState<Song[]>([])
  const [banner, setBanner] = useState("")
  const [playlist, setPlaylist] = useState<ChartInfo[]>([]);
  const [playing, setPlaying] = useState(false);
  const emptyChartContent: ChartContent = {song: emptySong, chart: emptyChart, stream: emptyStream, gimmick: emptyGimmick};
  const [chartContent, setChartContent] = useState(emptyChartContent);

  const setChartInfo = useCallback(async (song: Song, chart: Chart) => {
    console.log("setChartInfo:")
    console.log(audio)
    audio.pause()
    setIsLoading(true)
    
    const newAudioPromise = getAudio(`/${dir_prefix}${song.dir_name}/${song.music.path}`);
    const streamPromise = getSong(`/${dir_prefix}${song.dir_name}/${chart.difficulty}.json`);
    const gimmickPromise = getGimmick(`/${dir_prefix}${song.dir_name}/gimmick.json`);
    const banner = song.banner === "" ? "" : getBanner(`/${dir_prefix}${song.dir_name}/${song.banner}`);
    setSong(song)
    setChart(chart)
    const stream = await streamPromise;
    const gimmick = await gimmickPromise;
    setChartContent({song:song, chart:chart, stream:stream, gimmick:gimmick})
    const newAudio = await newAudioPromise;
    setAudio(newAudio)
    setPlaying(true)
    setBanner(await banner);
    newAudio.play();
    setIsLoading(false)
  }, [audio]);

  useEffect(() => {
    const f = async () => {
      setIsLoading(true);
      const clap = getAudio("/Clap-1.wav");
      const metronome = getAudio("/metronome.ogg");
      const songsJson = downloadFromDropbox(`/${dir_prefix}songs.json`);
      const blob = await songsJson
      const text = await blob.text();
      const songs: Song[] = JSON.parse(text)
      setSongs(songs)
      setClap(await clap);
      setMetronome(await metronome);
      setIsLoading(false);
    };
    f();
  }, []);
  const Loading = () => isLoading ? <ReactLoading type="spin" color="black" /> : <> </>
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Grid container direction="row" spacing={2}>
          <Grid item >
            <ChartArea chartContent={chartContent} audio={audio} clap={clap} metronome={metronome} playing={playing}
              setPlaying={(playing: boolean) => {
                setPlaying(playing);
                if (playing) {
                  audio.play();
                } else {
                  audio.pause();
                }
              }} />
          </Grid>
          <Grid item >
            <img src={banner === "" ? "/no_image.png" : banner} width="200" height="200" alt="banner" />
            <Box display="flex" justifyContent="center" m={1} width="300" >
              <Card sx={{ display: "inline-block", width: 300 }} >
                <SongInfo song={song} chart={chart} />
              </Card>
            </Box>
            <PlayListArea chartInfoList={playlist} setChartInfoList={setPlaylist} setChartInfo={setChartInfo} audio={audio} />
          </Grid>
        </Grid>
        <Loading />
        <SongTable songs={songs} setChartInfo={setChartInfo} addToPlaylist={(selecteds) => {
          console.log("addToPlaylist")
          setPlaylist(playlist.concat(selecteds))
        }} />
      </Box>
    </Container>
  );
}

export default App;
