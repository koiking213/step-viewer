import React from "react"
import { Song } from '../types/index'
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type SongTableProps = {songs: Song[], setSong:(title: string, dirName: string, difficulty: string, musicPath: string, musicOffset: number) => void}
export const SongTable = ({songs, setSong}: SongTableProps) => {
  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      width: 300,
    },
    {
      field: "difficulty",
      headerName: "Difficulty",
      width: 150,
    },
    {
      field: "level",
      headerName: "Level",
      width: 120,
    },
    {
      field: "combo",
      headerName: "Combo",
      width: 150,
    },
    {
      field: "bpm",
      headerName: "BPM",
      width: 150,
    },
    {
      field: "stream",
      headerName: "STR",
    },
    {
      field: "voltage",
      headerName: "VOL",
    },
    {
      field: "air",
      headerName: "AIR",
    },
    {
      field: "freeze",
      headerName: "FRE",
    },
    {
      field: "chaos",
      headerName: "CHA",
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
        music_path: song.music.path,
        music_offset: song.music.offset,
      })
    })).flat(),
    [songs]
  )
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        onRowClick={(params, _event, _details) => {
          console.log(params)
          const row = params.row
          setSong(row.title, row.dir_name, row.difficulty, row.music_path, row.music_offset)
        }}
      />
    </div>
  )
}