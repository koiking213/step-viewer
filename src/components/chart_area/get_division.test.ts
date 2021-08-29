import { getDivision } from './get_division';
import { TimingInfo } from '../../types';

test('get_division', () => {
  const timingInfo1: TimingInfo[] = [{type: 'soflan', division: 0, value: 120}];
  expect(getDivision(5, timingInfo1)).toBe(2.5);
  const timingInfo2: TimingInfo[] = [
    {type: 'soflan', division: 0, value: 120},
    {type: 'stop', division: 1, value: 1},
  ];
  expect(getDivision(5, timingInfo2)).toBe(2);
  const timingInfo3: TimingInfo[] = [
    {type: 'soflan', division: 0, value: 120},
    {type: 'soflan', division: 1, value: 240},
    {type: 'soflan', division: 2, value: 120},
  ];
  expect(getDivision(1, timingInfo3)).toBe(0.5);
  expect(getDivision(3, timingInfo3)).toBe(2);
  expect(getDivision(5, timingInfo3)).toBe(3);
});
