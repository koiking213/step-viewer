import { TimingInfo } from "../../types/index";

// todo: 流石にもうちょっと簡潔に書けるはず
// bpm120, 1divに2sかかる -> 1divにかかるtime = 4/(bpm/60)
// bps = bpm/60
// d/s = bpm/240
// time = div*240/bpm
// div = time*bpm/240
function getTimeFromDiv(division: number, bpm: number) {
  return division * 240 / bpm
}
function getDivFromTime(time: number, bpm: number) {
  return time * bpm / 240
}

// timeは秒
function getDivisionRecur(time: number, doneTime: number, gimmicks: TimingInfo[], y: number, bpm: number): number {
  const newDivision = y + getDivFromTime((time - doneTime), bpm)
  if (gimmicks.length === 0) {
    return newDivision
  }
  const gimmick = gimmicks[0]
  if (newDivision < gimmick.division) {
    return newDivision
  }

  // ここに来る時点でgimmickの影響は受ける
  if (gimmick.type === "stop") {
    doneTime += getTimeFromDiv((gimmick.division - y), bpm) // stopに至るまでに必要な時間
    doneTime += gimmick.value // stopで消費される時間
    if (time < doneTime) { // stopの最中
      return gimmick.division
    } else {
      return getDivisionRecur(time, doneTime, gimmicks.slice(1), gimmick.division, bpm)
    }
  } else { // soflan
    doneTime += getTimeFromDiv((gimmick.division - y), bpm)
    return getDivisionRecur(time, doneTime, gimmicks.slice(1), gimmick.division, gimmick.value)
  }
}



// timeは秒
export function getDivision(time: number, gimmicks: TimingInfo[]): number {
  // todo: 最初がstopだとバグる
  const bpm = gimmicks[0].value
  const ret = getDivisionRecur(time, 0, gimmicks.slice(1), 0, bpm)
  return ret
}