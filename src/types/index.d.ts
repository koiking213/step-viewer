
export type Direction = "up" | "right" | "left" | "down"

export type Color = "red" | "blue" | "yellow" | "green"

export type Song = {
  title: string;
  dir_name: string;
  charts: Chart[];
  bpm: number;
  music: {
    path: string;
    offset: number;
  }
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
      }];
      color: Color;
      offset: number;
  }[];
  cost: number;
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
