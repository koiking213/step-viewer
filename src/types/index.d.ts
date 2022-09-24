import { AudioHTMLAttributes } from "react"

export type Direction = "up" | "right" | "left" | "down"

export type Color = "red" | "blue" | "yellow" | "green"

export type Song = {
  title: string;
  dir_name: string;
  charts: Chart[];
  bpm: string;
  music: {
    path: string;
    offset: number;
  }
  banner: string;
  timestamp: string;
}

export type Chart = {
  difficulty: string;
  level: number;
  max_combo: number;
  stream: number;
  voltage: number;
  air: number;
  freeze: number;
  chaos: number;
}


export type Stream = {
  stream: {
    arrows: [{
      direction: Direction;
      type: string;
      end: number;
      end_time: number;
    }];
    color: Color;
    offset: number;
    time: number;
  }[];
  cost: number;
  gimmick: Gimmick;
}

export type Soflan = {
  division: number;
  bpm: number;
};

export type Stop = {
  division: number;
  time: number;
}

export type Gimmick = {
  soflan: Soflan[];
  stop: Stop[];
}

type GimmickType = 'soflan' | 'stop';

export type TimingInfo = {
  type: GimmickType;
  division: number;
  value: number;
};

export type ChartContent = {
  song: Song;
  chart: Chart;
  stream: Stream;
}

export type SongScore = {
  name: string;
  charts: ChartScore[];
}

export type ChartScore = {
  difficulty: string;
  scores: PlayerScore[];
}

export type PlayerScore = {
  score: number;
  player: string;
}

export type PlayerID = {
  id: string;
  name: string;
}

export type PlayerIDs = {
  players: PlayerID[];
}