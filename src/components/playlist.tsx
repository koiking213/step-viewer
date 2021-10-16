import { Song, Chart } from '../types/index'
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type ChartInfo = {song: Song, chart: Chart};


type PlayListAreaProps = {chartInfoList: ChartInfo[], setChartInfo: (song: Song, chart: Chart) => void };
export const PlayListArea = ({chartInfoList, setChartInfo}: PlayListAreaProps) => {
  async function onRowClick(song: Song, chart: Chart) {
    setChartInfo(song, chart)
  };
  const columns: GridColDef[] = [
    {
      field: "level",
      headerName: "Level",
      width: 20,
      type: "number",
    },
    {
      field: "title",
      headerName: "Title",
      width: 250,
    },
  ]
  const rows = 
    chartInfoList.map(({song, chart}: ChartInfo, i: number) => {
      return ({
        id: i,
        title: song.title,
        difficulty: chart.difficulty,
        level: chart.level,
        dir_name: song.dir_name,
        song: song,
        chart: chart,
      })
    });
  return (
    <div style={{ height: 400, width: 200 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableColumnMenu={true}
        disableColumnSelector={true}
        onRowClick={(params, _event, _details) => {
          console.log(params)
          const row = params.row
          onRowClick(row.song, row.chart)
        }}
      />
    </div>
  )
}