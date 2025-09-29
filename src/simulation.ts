import * as fs from "fs";
import { RequestMatcher, requestSignature } from "./simulation/request";
import { ResponseData } from "./simulation/response";

type DelayConfig = {
  urlPattern: string;
  httpMethod: string;
  delay: number;
};

type DelayLogNormalConfig = {
  urlPattern: string;
  httpMethod: string;
  min: number;
  max: number;
  mean: number;
  median: number;
};

export type Simulation = {
  data: {
    pairs: Array<{ request: RequestMatcher; response: ResponseData }>;
    globalActions: {
      delays: Array<DelayConfig>;
      delaysLogNormal: Array<DelayLogNormalConfig>;
    };
  };
  meta: {
    schemaVersion: string;
    hoverflyVersion: string;
    timeExported: string;
  };
};

export function buildSimulation(pairs: Array<{ request: RequestMatcher; response: ResponseData }>): Simulation {
  return {
    data: {
      pairs,
      globalActions: { delays: [], delaysLogNormal: [] },
    },
    meta: {
      schemaVersion: "v5.2",
      hoverflyVersion: "v1.9.0",
      timeExported: "2024-10-31T08:40:30Z",
    },
  };
}

export function buildSimulationFromJSONString(payload: string): Simulation {
  return JSON.parse(payload) as Simulation;
}

export function buildSimulationFromFile(path: string): Simulation {
  return buildSimulationFromJSONString(fs.readFileSync(path, "utf-8"));
}

export function saveSimulationToFile(sim: Simulation, path: string): void {
  const content = JSON.stringify(sim);
  fs.writeFileSync(path, content);
}

function subtractPairs(
  left: Array<{ request: RequestMatcher; response: ResponseData }>,
  right: Array<{ request: RequestMatcher; response: ResponseData }>,
): Array<{ request: RequestMatcher; response: ResponseData }> {
  const rightSignatures = right.map((p) => requestSignature(p.request));
  return left.filter((p) => !rightSignatures.includes(requestSignature(p.request)));
}

// TODO: introduce different modes for handling of a duplicated request:
// * overwite (the existing one)
// * skip (todo)
// * raise error (todo)
export function mergeSimulations(left: Simulation, right: Simulation): Simulation {
  const leftPairsToKeep = subtractPairs(left.data.pairs, right.data.pairs);
  return buildSimulation(leftPairsToKeep.concat(right.data.pairs));
}

export function subtractSimulations(left: Simulation, right: Simulation): Simulation {
  const leftPairsToKeep = subtractPairs(left.data.pairs, right.data.pairs);
  return buildSimulation(leftPairsToKeep);
}
