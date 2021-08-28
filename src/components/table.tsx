//import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React from "react"
import { useTable, usePagination, useSortBy, useFilters, useBlockLayout, Column, Row } from 'react-table'
import { matchSorter } from 'match-sorter'
import { Song } from '../types/index'
import IconButton from '@material-ui/core/IconButton';
import DownloadIcon from '@material-ui/icons/Download';

function DefaultColumnFilter(
  width: string,
  args: {
    column: { filterValue: string | number, setFilter: (val: string|number|undefined) => void },
  }) {

  return (
    <input
      value={args.column.filterValue || ''}
      onChange={e => {
        args.column.setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search`}
      style={{ width: width }}
    />
  )
}

function SelectColumnFilter(
  options: string[],
  args: {
    column: { filterValue: number|string|undefined, setFilter: (val: number|string|undefined) => void },
  }) {
  // Calculate the options for filtering
  // using the preFilteredRows

  // Render a multi-select box
  return (
    <select
      value={args.column.filterValue}
      onChange={e => {
        args.column.setFilter(e.target.value || undefined)
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Challenge', 'Edit']

function fuzzyTextFilterFn(rows: Row[], id: string, filterValue: any) {
  return matchSorter(rows, filterValue, { keys: [(row:Row) => row.values[id]] })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val:any) => !val


type SongTableProps = {songs: Song[], setSong:(title: string, dirName: string, difficulty: string, musicPath: string, musicOffset: number) => void}
export const SongTable = ({songs, setSong}: SongTableProps) => {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows: Row[], id: string, filterValue: any) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
              .toLowerCase()
              .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
    }),
    []
  )
  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
      width: 60,
    }),
    []
  )

  interface Data {
    title: string;
    difficulty: string;
    level: number;
    max_combo: number;
    dir_name: string;
    stream: number;
    voltage: number;
    air: number;
    freeze:number;
    chaos: number;
    bpm: number;
    music_path: string;
    music_offset: number;
    view: string;
  }

  const data: Data[] = React.useMemo(
    () => songs.map(song => song.charts.map((chart:any) => {
      return ({
        title: song.title,
        difficulty: chart.difficulty,
        level: chart.level,
        max_combo: chart.max_combo,
        dir_name: song.dir_name,
        stream: chart.stream,
        voltage: chart.voltage,
        air: chart.air,
        freeze: chart.freeze,
        chaos: chart.chaos,
        bpm: song.bpm,
        music_path: song.music.path,
        music_offset: song.music.offset,
        view: "",
      })
    })).flat(),
    [songs]
  )

  const columns: Column<Data>[] = React.useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title',
        Filter: DefaultColumnFilter.bind(null, '100%'),
        width: 300,
      },
      {
        Header: 'Difficulty',
        accessor: 'difficulty',
        Filter: SelectColumnFilter.bind(null, difficultyOptions),
        filter: 'includes',
        width: 100,
      },
      {
        Header: 'Level',
        accessor: 'level',
        Filter: DefaultColumnFilter.bind(null, '50px'),
      },
      {
        Header: 'Max Combo',
        accessor: 'max_combo',
        disableFilters: true,
      },
      {
        Header: 'STR',
        accessor: 'stream',
        disableFilters: true,
      },
      {
        Header: 'VOL',
        accessor: 'voltage',
        disableFilters: true,
      },
      {
        Header: 'AIR',
        accessor: 'air',
        disableFilters: true,
      },
      {
        Header: 'FRE',
        accessor: 'freeze',
        disableFilters: true,
      },
      {
        Header: 'CHA',
        accessor: 'chaos',
        disableFilters: true,
      },
      {
        Header: 'BPM',
        accessor: 'bpm',
        disableFilters: true,
      },
      {
        Header: 'dir name',
        accessor: 'dir_name',
      },
      {
        Header: 'music path',
        accessor: 'music_path',
      },
      {
        Header: 'music offset',
        accessor: 'music_offset',
        disableFilters: true,
      },
      {
        Header: 'view',
        accessor: 'view',
        disableFilters: true,
        width: 60,
        Cell: ({ cell }: {cell: any}) => (
          <IconButton onClick={() => {
            setSong(cell.row.values.title, cell.row.values.dir_name, cell.row.values.difficulty, cell.row.values.music_path, cell.row.values.music_offset)
          }
          }>
            <DownloadIcon />
          </IconButton>
        )
      },
    ],
    [setSong]
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,

    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable({
    columns,
    data,
    defaultColumn,
    filterTypes,
    initialState: {
      hiddenColumns: ["dir_name", "music_path"],
      pageSize: 10,
    },
  },
    useBlockLayout,
    useFilters,
    useSortBy,
    usePagination,
  )
  return (
    <div className={styles.songTable}>
      <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
        <thead>
          {headerGroups.map((headerGroup:any) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column:any, i:number) => (
                <th
                  style={{
                    border: 'solid 1px gray',
                    borderBottom: 'solid 3px red',
                    background: 'aliceblue',
                    color: 'black',
                    fontWeight: 'bold',
                    width: column.width,
                  }}
                  key={i}
                >
                  <div
                    {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </div>
                  <div>{column.canFilter ? column.render('Filter') : null}</div>

                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} style={{ height: 460, overflowY: 'scroll', display: 'block' }}>
          {page.map((row:any) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell:any) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        padding: '10px',
                        border: 'solid 1px gray',
                        background: 'papayawhip',
                        width: cell.column.width,
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default SongTable;