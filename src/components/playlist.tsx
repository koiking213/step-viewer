import { Song, Chart } from '../types/index'

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@mui/material/Typography';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LoopIcon from '@mui/icons-material/Loop';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCallback, useEffect, useState } from 'react';
import { ListItem, ToggleButton } from '@material-ui/core';

type ChartInfo = { song: Song, chart: Chart };

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Beginner": return "#afeeee"
    case "Easy": return "#ffe4c4"
    case "Medium": return "#ffa07a"
    case "Hard": return "#98fb98"
    case "Challenge": return "#ee82ee"
    case "Edit": return "#a9a9a9"
  }
  return "#ffffff"
}

function getDifficultyColorSelected(difficulty: string) {
  switch (difficulty) {
    case "Beginner": return "#8fcece"
    case "Easy": return "#dfc4a4"
    case "Medium": return "#df805a"
    case "Hard": return "#78db78"
    case "Challenge": return "#ce62ce"
    case "Edit": return "#898989"
  }
  return "#dddddd"
}

type RowProps = { chartInfo: ChartInfo, clickHandler: (song: Song, chart: Chart, key: number) => void, id: number, playing: boolean, deleteSelf: (id: number) => void }
const Row = ({ chartInfo, clickHandler, id, playing, deleteSelf }: RowProps) => {
  const song = chartInfo.song
  const chart = chartInfo.chart
  const cardColor = playing ? getDifficultyColorSelected(chart.difficulty) : getDifficultyColor(chart.difficulty)
  return (
    <Card sx={{ bgcolor: cardColor }}>
      <ListItem
        secondaryAction={
          <IconButton edge="end" aria-label="comments" onClick={() => { deleteSelf(id) }}>
            <DeleteIcon />
          </IconButton>
        }
        disablePadding
      >
        <ListItemButton onClick={() => {
          clickHandler(song, chart, id)
        }}>
          {playing ? <ListItemIcon><PlayCircleOutlineIcon /></ListItemIcon> : <></>}
          <ListItemText
            primary={`${chart.level} ${song.title}`}
          />
        </ListItemButton>
      </ListItem>
    </Card>
  )
}


type PlayListAreaProps = { chartInfoList: ChartInfo[], setChartInfoList: (chartInfoList: ChartInfo[]) => void, setChartInfo: (song: Song, chart: Chart) => void, audio: HTMLAudioElement };
export const PlayListArea = ({ chartInfoList, setChartInfoList, setChartInfo, audio }: PlayListAreaProps) => {
  const [loopSelected, setLoopSelected] = useState(false);
  const [currentId, setCurrentId] = useState(0);
  const [inPlaylist, setInPlaylist] = useState(false);
  const onRowClick = useCallback(async (song: Song, chart: Chart, id: number) => {
    setChartInfo(song, chart)
    setCurrentId(id)
    setInPlaylist(true)
  }, [setChartInfo]);
  function deleteSelf(id: number) {
    console.log(id)
    chartInfoList.splice(id, 1)
    console.log(id)
    if (id === currentId) {
      setInPlaylist(false);
    }
    if (id <= currentId) {
      setCurrentId(currentId - 1);
    }
    setChartInfoList(chartInfoList.concat())
  }
  function shuffle() {
    const array = chartInfoList.concat();
    // Fisher-Yates
    for (var i = array.length - 1; i > 0; i--) {
      var r = Math.floor(Math.random() * (i + 1));
      var tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
    setChartInfoList(array);
    const head = array[0];
    onRowClick(head.song, head.chart, 0);
  }
  function deleteAll() {
    setChartInfoList([]) 
    setCurrentId(0)
    setInPlaylist(false)
  }
  const rows = chartInfoList.map((info, i) => <Row chartInfo={info} clickHandler={onRowClick} id={i} key={i} playing={i === currentId && inPlaylist} deleteSelf={deleteSelf} />)
  useEffect(() => {
    console.log("playlist updated")
    audio.onended = (_event) => {
      const newId = loopSelected && (currentId >= chartInfoList.length - 1) ? 0 : currentId + 1
      if (newId < chartInfoList.length) {
        const row = chartInfoList[newId];
        onRowClick(row.song, row.chart, newId);
      }
    }
  }, [audio, chartInfoList, loopSelected, currentId, onRowClick]);
  return (
    <Card>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {`Play List (${chartInfoList.length === 0 ? 0 : currentId + 1}/${chartInfoList.length})`}
      </Typography>
      <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
        <ToggleButton
          value="check"
          selected={loopSelected}
          onChange={() => {
            setLoopSelected(!loopSelected);
          }}
        >
          <LoopIcon />
        </ToggleButton>
        <IconButton edge="end" aria-label="comments" onClick={shuffle}>
          <ShuffleIcon />
        </IconButton>
        <IconButton edge="end" aria-label="comments" onClick={deleteAll}>
          <DeleteIcon />
        </IconButton>
      </Typography>
      <List
        sx={{
          width: '100%',
          maxWidth: 300,
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'auto',
          maxHeight: 250,
          '& ul': { padding: 0 },
        }}
      >
        {rows}
      </List>
    </Card>
  )
}