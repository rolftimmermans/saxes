import { expect } from "chai";
import { EVENTS, SaxesOptions, SaxesParser } from "../build/dist/saxes";

export interface TestOptions {
  xml?: string | string[];
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect: any[];
  fn?: (parser: SaxesParser<{}>) => void;
  opt?: SaxesOptions;
}

export function test(options: TestOptions): void {
  const { xml, name, expect: expected, fn } = options;
  it(name, () => {
    const parser = new SaxesParser(options.opt);
    let expectedIx = 0;
    for (const ev of EVENTS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-loop-func
      parser.on(ev, (n: any) => {
        if (process.env.DEBUG !== undefined) {
          console.error({
            expected: expected[expectedIx],
            actual: [ev, n],
          });
        }
        if (expectedIx >= expected.length && (ev === "end" || ev === "ready")) {
          return;
        }

        expect([ev, ev === "error" ? n.message : n]).to.deep
          .equal(expected[expectedIx]);
        expectedIx++;
      });
    }

    expect(xml !== undefined || fn !== undefined, "must use xml or fn")
      .to.be.true;

    if (xml !== undefined) {
      if (Array.isArray(xml)) {
        for (const chunk of xml) {
          parser.write(chunk);
        }
        parser.close();
      }
      else {
        parser.write(xml).close();
      }
    }

    if (fn !== undefined) {
      fn(parser);
    }

    expect(expectedIx).to.equal(expected.length);
  });
}
