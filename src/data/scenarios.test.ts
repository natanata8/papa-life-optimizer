import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/components/HomePage";
import { MVP_SCENARIO_TITLES, scenarios } from "@/data/scenarios";

describe("MVP scenarios", () => {
  it("keeps the four initial scenarios in the declared order", () => {
    expect(scenarios.map((scenario) => scenario.title)).toEqual([
      ...MVP_SCENARIO_TITLES,
    ]);
  });

  it("keeps every scenario in skeleton status", () => {
    expect(scenarios.every((scenario) => scenario.status === "skeleton")).toBe(
      true,
    );
  });
});

describe("HomePage", () => {
  it("renders the product name and all MVP scenario titles", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("papa-life-optimizer");
    expect(html).toContain(
      "育児中の父親が、自分の時間も大切にしながら家庭をうまく回すためのWebサービス",
    );
    expect(html).not.toContain("家庭を止めずに");
    expect(html).not.toContain("自分時間を、家庭の手順にする");
    for (const title of MVP_SCENARIO_TITLES) {
      expect(html).toContain(title);
    }
  });
});
