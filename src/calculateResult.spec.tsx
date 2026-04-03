import {describe, expect, test} from "vitest";
import {crt, narrow2d6} from "./calculateResult";

describe('calculateResult', () => {
  test('narrow2d6', () => {
    const _actual = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const _expect = [+1, +1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 12];
    expect(_actual.map(narrow2d6)).toEqual(_expect)
  });

  test('crt', () => {
    expect(crt).toEqual({
        1: {"1": "-", "2": "-", "3": "-", "4": "-", "Javelin": "-", "NLAW": "-", "RPG": "-", "Stabber": "-",},
        2: {"1": "-", "2": "-", "3": "-", "4": "S", "Javelin": "S", "NLAW": "-", "RPG": "-", "Stabber": "-",},
        3: {"1": "-", "2": "-", "3": "S", "4": "S", "Javelin": "S", "NLAW": "S", "RPG": "-", "Stabber": "-",},
        4: {"1": "-", "2": "-", "3": "S", "4": 1, "Javelin": 1, "NLAW": "S", "RPG": "-", "Stabber": "S",},
        5: {"1": "-", "2": "S", "3": "S", "4": 1, "Javelin": 1, "NLAW": 1, "RPG": "-", "Stabber": "S",},
        6: {"1": "-", "2": "S", "3": 1, "4": 1, "Javelin": 2, "NLAW": 1, "RPG": "-", "Stabber": 1,},
        7: {"1": "S", "2": "S", "3": 1, "4": 2, "Javelin": 2, "NLAW": 1, "RPG": "S", "Stabber": 1,},
        8: {"1": "S", "2": 1, "3": 1, "4": 2, "Javelin": 2, "NLAW": 2, "RPG": "S", "Stabber": 1,},
        9: {"1": "S", "2": 1, "3": 2, "4": 2, "Javelin": 2, "NLAW": 2, "RPG": "S", "Stabber": 2,},
        10: {"1": 1, "2": 1, "3": 2, "4": 2, "Javelin": 2, "NLAW": 2, "RPG": 1, "Stabber": 2,},
        11: {"1": 1, "2": 2, "3": 2, "4": 3, "Javelin": 2, "NLAW": 2, "RPG": 1, "Stabber": 2,},
        12: {"1": 1, "2": 2, "3": 2, "4": 3, "Javelin": 2, "NLAW": 2, "RPG": 1, "Stabber": 2,},
      }
    )
  })
});