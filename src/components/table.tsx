import React, { useState } from "react"
import { Song, Chart } from '../types/index'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Button } from "@material-ui/core";

type ChartInfo = { song: Song, chart: Chart };
type SongTableProps = { songs: Song[], setChartInfo: (song: Song, chart: Chart) => void, addToPlaylist: (info: ChartInfo[]) => void }
export const SongTable = ({ songs, setChartInfo: setChart, addToPlaylist }: SongTableProps) => {
  const [selectedCharts, setSelectedCharts] = useState<ChartInfo[]>([]);
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
      type: "string",
      sortComparator: (v1, v2, param1, param2) => {
        const bpm1: string = param1.api.getCellValue(param1.id, 'bpm')
        const bpm2: string = param2.api.getCellValue(param2.id, 'bpm')
        console.log(bpm1, typeof bpm1)
        console.log(bpm2, typeof bpm2)
        return (parseInt((bpm1.split('-')[1] || bpm1.split('-')[0]), 10) -
          (parseInt((bpm2.split('-')[1] || bpm2.split('-')[0]), 10)))
      },
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
  const rows = React.useMemo(() =>
    songs.map((song, i) => song.charts.map((chart: any, j: number) => {
      return ({
        id: i * 10 + j,
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
        checkboxSelection
        disableSelectionOnClick
        onRowClick={(params, _event, _details) => {
          console.log(params)
          const row = params.row
          setChart(row.song, row.chart)
        }}
        onSelectionModelChange={(ids) => {
          const selectedIDs = new Set(ids);
          const selectedRowData = rows.filter((row) =>
            selectedIDs.has(row.id)
          );
          const infos: ChartInfo[] = selectedRowData.map((row) => {
            const info: ChartInfo = { song: row.song, chart: row.chart };
            return info
          });
          setSelectedCharts(infos);
        }}
        components={{
          Toolbar: GridToolbar,
        }}
      />
      <Button variant="contained" onClick={() => { addToPlaylist(selectedCharts) }} >add selected charts to the play list</Button>
    </div>
  )
}