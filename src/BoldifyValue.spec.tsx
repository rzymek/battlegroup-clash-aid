import {describe, expect, it} from "vitest";
import {render} from "@testing-library/preact";
import {BoldifyValue} from "./BoldifyValue.tsx";

const values = {
  lightWood: "Light Wood",
  denseWood: "Dense Wood",
  lightUrban: "Light Urban",
  urban: "Urban",
} as const;

describe("BoldifyValue", () => {
  it("boldify value", () => {
    const {container} = render(<BoldifyValue value={"lightWood"} values={values}>
      Target is Foot FE in [Light Wood]*/[Light Urban] / [Dense Wood]*/[Urban]
    </BoldifyValue>);
    expect(container.innerHTML).toContain("Target is Foot FE in <b>Light Wood</b>*/Light Urban / Dense Wood*/Urban");
  });

  it("boldify exact value", () => {
    const {container} = render(<BoldifyValue value={"urban"} values={values}>
      Target is Foot FE in [Light Wood]*/[Light Urban] / [Dense Wood]*/[Urban]
    </BoldifyValue>);
    expect(container.innerHTML).toContain("Target is Foot FE in Light Wood*/Light Urban / Dense Wood*/<b>Urban</b>");
  });

  it("preserve text on no match", () => {
    const {container} = render(<BoldifyValue value={"lightWood"} values={values}>
      Target is Foot FE
    </BoldifyValue>);
    expect(container.innerHTML).toContain("Target is Foot FE");
  });

  it("remove markers on no match", () => {
    const {container} = render(<BoldifyValue value={"wood"} values={values}>
      Target is Foot FE in [Light Wood]*/[Light Urban] / [Dense Wood]*/[Urban]
    </BoldifyValue>);
    expect(container.innerHTML).toContain("Target is Foot FE in Light Wood*/Light Urban / Dense Wood*/Urban");
  });
});