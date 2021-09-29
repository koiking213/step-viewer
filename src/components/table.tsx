import React from "react"
import { Song, Chart } from '../types/index'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';

type SongTableProps = {songs: Song[], setChartInfo:(song: Song, chart: Chart) => void}
export const SongTable = ({songs, setChartInfo: setChart}: SongTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      width: 250,
    },
    {
      field: "difficulty",
      headerName: "Difficulty",
      width: 120,
    },
    {
      field: "level",
      headerName: "Level",
      width: 100,
      type: "number",
    },
    {
      field: "combo",
      headerName: "Combo",
      width: 110,
      type: "number",
    },
    {
      field: "bpm",
      headerName: "BPM",
      width: 100,
      type: "number",
    },
    {
      field: "stream",
      headerName: "STR",
      width: 90,
      type: "number",
    },
    {
      field: "voltage",
      headerName: "VOL",
      width: 90,
      type: "number",
    },
    {
      field: "air",
      headerName: "AIR",
      width: 90,
      type: "number",
    },
    {
      field: "freeze",
      headerName: "FRE",
      width: 90,
      type: "number",
    },
    {
      field: "chaos",
      headerName: "CHA",
      width: 90,
      type: "number",
    },
  ]
  const rows = React.useMemo (() => 
    songs.map((song, i) => song.charts.map((chart:any, j:number) => {
      return ({
        id: i*10+j,
        title: song.title,
        difficulty: chart.difficulty,
        level: chart.level,
        combo: chart.max_combo,
        dir_name: song.dir_name,
        stream: chart.stream,
        voltage: chart.voltage,
        air: chart.air,
        freeze: chart.freeze,
        chaos: chart.chaos,
        bpm: song.bpm,
        song: song,
        chart: chart,
      })
    })).flat(),
    [songs]
  )
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableColumnMenu={true}
        onRowClick={(params, _event, _details) => {
          console.log(params)
          const row = params.row
          setChart(row.song, row.chart)
        }}
        components={{
          Toolbar: GridToolbar,
        }}
      />
    </div>
  )
}