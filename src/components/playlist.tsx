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
import { useEffect, useState } from 'react';
import { ListItem } from '@material-ui/core';

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

type RowProps = { chartInfo: ChartInfo, clickHandler: (song: Song, chart: Chart, key: number) => void, id: number, playing: boolean }
const Row = ({ chartInfo, clickHandler, id, playing }: RowProps) => {
  const song = chartInfo.song
  const chart = chartInfo.chart
  const cardColor = playing ? "#dddddd" : "#ffffff"
  return (
    <Card sx={{ bgcolor: cardColor }}>
      <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="comments">
                <DeleteIcon/>
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
          sx={{ bgcolor: getDifficultyColor(chart.difficulty) }}
        />
      </ListItemButton>
</ListItem>
    </Card>
  )
}


type PlayListAreaProps = { chartInfoList: ChartInfo[], setChartInfo: (song: Song, chart: Chart) => void, audio: HTMLAudioElement };
export const PlayListArea = ({ chartInfoList, setChartInfo, audio }: PlayListAreaProps) => {
  async function onRowClick(song: Song, chart: Chart, id: number) {
    setChartInfo(song, chart)
    setCurrentId(id)
  };
  const [currentId, setCurrentId] = useState(0);
  const rows = chartInfoList.map((info, i) => <Row chartInfo={info} clickHandler={onRowClick} id={i} key={i} playing={i === currentId} />)
  useEffect(() => {
    audio.onended = (_event) => {
      const newId = currentId + 1
      if (newId < chartInfoList.length) {
        const row = chartInfoList[newId];
        onRowClick(row.song, row.chart, newId);
      }
    }
  }, [audio, chartInfoList]);
  return (
    <Card>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {`Play List (${chartInfoList.length === 0 ? 0 : currentId + 1}/${chartInfoList.length})`}
      </Typography>
      <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
        <LoopIcon/>
        <ShuffleIcon/>
        <DeleteIcon/>
      </Typography>
      <List
        sx={{
          width: '100%',
          maxWidth: 300,
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'auto',
          maxHeight: 300,
          '& ul': { padding: 0 },
        }}
      >
        {rows}
      </List>
    </Card>
  )
}