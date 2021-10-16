import { Song, Chart } from '../types/index'

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useState } from 'react';

type ChartInfo = {song: Song, chart: Chart};

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

type RowProps = {chartInfo: ChartInfo, clickHandler: (song: Song, chart: Chart, key: number) => void, id: number}
const Row = ({chartInfo, clickHandler, id}: RowProps) => {
  const song = chartInfo.song
  const chart = chartInfo.chart
  return (
    <ListItemButton onClick={() => {
      clickHandler(song, chart, id)
      }}>
      <ListItemText 
        primary={`${chart.level} ${song.title}`}
        sx={{bgcolor: getDifficultyColor(chart.difficulty)}}
         />
    </ListItemButton>
  )
}


type PlayListAreaProps = {chartInfoList: ChartInfo[], setChartInfo: (song: Song, chart: Chart) => void, audio: HTMLAudioElement };
export const PlayListArea = ({chartInfoList, setChartInfo, audio}: PlayListAreaProps) => {
  async function onRowClick(song: Song, chart: Chart, id: number) {
    setChartInfo(song, chart)
    setCurrentId(id)
  };
  const [currentId, setCurrentId] = useState(0);
  const rows = chartInfoList.map((info, i)=> <Row chartInfo={info} clickHandler={onRowClick} id={i} key={i} />)
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
  )
}