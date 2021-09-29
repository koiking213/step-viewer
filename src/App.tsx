import './App.css';

import { useEffect, useState } from "react"
import { Stream, Gimmick, Song } from './types/index'
import { Dropbox } from 'dropbox'
import ReactLoading from 'react-loading';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import {SongTable} from './components/table'
import ChartArea from './components/chart_area'

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

type SongInfoProps = { title: string, difficulty: string };
const SongInfo = ({ title, difficulty }: SongInfoProps) => {
  return <div>{`${title} (${difficulty})`}</div>
}

function App() {
  const emptyStream: Stream = JSON.parse('{"stream":[], "cost":-1}');
  const emptyGimmick: Gimmick = JSON.parse('{"soflan":[{"division": 0, "bpm": 120}], "stop":[]}');
  const [stream, setStream] = useState(emptyStream)
  const [gimmick, setGimmick] = useState(emptyGimmick)
  const [audio, setAudio] = useState<HTMLAudioElement>(new Audio('/silence.wav'))
  const [chartOffset, setChartOffset] = useState(0)
  const [title, setTitle] = useState('title')
  const [difficulty, setDifficulty] = useState('difficulty')
  const [isLoading, setIsLoading] = useState(false)
  const [songs, setSongs] = useState<Song[]>([])

  function setSong(title: string, dirName: string, difficulty: string, musicPath: string, musicOffset: number): void {
    audio.pause()
    setIsLoading(true)
    getSong(`/${dirName}/${difficulty}.json`, setStream)
    getGimmick(`/${dirName}/gimmick.json`, setGimmick)
    getAudio(`/${dirName}/${musicPath}`, setAudio, setIsLoading)
    setChartOffset(musicOffset)
    setTitle(title)
    setDifficulty(difficulty)
  }
  useEffect(() => {
    setIsLoading(true)
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
        <ChartArea stream={stream} gimmick={gimmick} audio={audio} chartOffset={chartOffset} />
        <Box display="flex" justifyContent="center" m={1}>
          <SongInfo title={title} difficulty={difficulty} />
          <Loading />
        </Box>
        <SongTable songs={songs} setSong={setSong}
        />
      </Box>
    </Container>
  );
}

export default App;
