import {describe, expect, it} from "vitest";
import {render} from "@testing-library/preact";
import {BoldifyValue} from "./BoldifyValue.tsx";

describe("BoldifyValue", () => {
  it("renders children as-is when value is undefined", () => {
    const {container} = render(<BoldifyValue value={"lightWood"} values={{
      lightWood: "Light Wood",
      urban: "Urban",
    }}>
      Target is Foot FE in Light Wood*/Light Urban / Dense Wood*/Urban
    </BoldifyValue>);
    expect(container.innerHTML).toContain("Target is Foot FE in <b>Light Wood</b>*/Light Urban / Dense Wood*/Urban");
  });
});