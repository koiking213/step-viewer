import React, { useEffect, useState } from "react"
import { DataGrid, GridColDef, GridRowData, GridToolbar } from '@mui/x-data-grid';
import { Song, SongScore, PlayerID } from '../types/index';

const ensure = function <T>(arg: T | undefined | null) {
  if (arg === undefined || arg === null) throw new Error('arg is undefined unexpectedly')
  return arg
}

type ScoreTableProps = { scores: SongScore[], ids: PlayerID[], songs: Song[] };
export const ScoreTable = ({ scores, ids, songs }: ScoreTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "song_name",
      headerName: "Song",
      width: 250,
    },
    {
      field: "level",
      headerName: "Level",
      width: 120,
    },
    {
      field: "difficulty",
      headerName: "Difficulty",
      width: 120,
    },
  ].concat(
    ids.map(player_id => {
      return {
        field: player_id.name,
        headerName: player_id.name,
        width: 120,
      }
    })
  );
  const rows = React.useMemo(() =>
    scores.filter((score) => songs.some((song) => song.dir_name == score.name)).map(song =>
      song.charts.map(chart => {
        let song_info = ensure(songs.find((s) => s.dir_name == song.name))
        let chart_info = ensure(song_info.charts.find((c) => c.difficulty == chart.difficulty))
        let row: GridRowData =
        {
          id: song.name + chart.difficulty,
          song_name: song_info.title,
          difficulty: chart.difficulty,
          level: chart_info.level,
        };
        chart.scores.map(player_score => {
          row[player_score.player] = player_score.score;
        })
        return row;
      }
      )).flat().flat(),
    [scores]
  )
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
      />
    </div>
  )
}