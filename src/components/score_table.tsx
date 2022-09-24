import React, { useEffect, useState } from "react"
import { DataGrid, GridColDef, GridRowData, GridToolbar } from '@mui/x-data-grid';
import { SongScore, PlayerID } from '../types/index';

type ScoreTableProps = { scores: SongScore[], ids: PlayerID[] };
export const ScoreTable = ({ scores, ids }: ScoreTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "song",
      headerName: "Song",
      width: 250,
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
    scores.map(song =>
      song.charts.map(chart => {
        let row: GridRowData =
        {
          id: song.name + chart.difficulty,
          song: song.name,
          difficulty: chart.difficulty,
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