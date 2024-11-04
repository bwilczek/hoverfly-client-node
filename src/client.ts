import * as axios from "axios";
import { MiddlewarePayload } from "./middleware";
import { ModePayload, SetModePayload } from "./mode";
import { mergeSimulations, Simulation, buildSimulation } from "./simulation";
import { RequestMatcher } from "./simulation/request";
import { ResponseData } from "./simulation/response";
import { Journal, JournalSearchPayload } from "./journal";

export class Client {
  http: axios.AxiosInstance;

  constructor(baseUrl: string = "http://127.0.0.1:8888/") {
    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 1000,
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    });
  }

  async alive(): Promise<boolean> {
    try {
      await this.getMode();
      return true;
    } catch {
      return false;
    }
  }

  async getMode(): Promise<ModePayload> {
    const response = await this.http.get("/api/v2/hoverfly/mode");
    return response.data as Promise<ModePayload>;
  }

  async setMode(payload: SetModePayload): Promise<ModePayload> {
    const response = await this.http.put("/api/v2/hoverfly/mode", payload);
    if (response.status !== 200) {
      throw new Error(`Hoverfly mode rejected. Payload: ${JSON.stringify(payload)} Response: ${response.data.error}`);
    }
    return response.data as Promise<ModePayload>;
  }

  async purgeMiddleware(): Promise<MiddlewarePayload> {
    return this.setMiddleware({ remote: "", binary: "", script: "" });
  }

  async setMiddleware(payload: MiddlewarePayload): Promise<MiddlewarePayload> {
    const response = await this.http.put("/api/v2/hoverfly/middleware", payload);
    if (response.status !== 200) {
      throw new Error(
        `Hoverfly middleware rejected. Payload: ${JSON.stringify(payload)} Response: ${response.data.error}`,
      );
    }
    return response.data as Promise<MiddlewarePayload>;
  }

  async getMiddleware(): Promise<MiddlewarePayload> {
    const response = await this.http.get("/api/v2/hoverfly/middleware");
    return response.data as Promise<MiddlewarePayload>;
  }

  async purgeJournal(): Promise<Journal> {
    const response = await this.http.delete("/api/v2/journal");
    if (response.status !== 200) {
      throw new Error(`Hoverfly could not delete journal. Response: ${response.data.error}`);
    }
    return response.data as Promise<Journal>;
  }

  async getJournal(): Promise<Journal> {
    const response = await this.http.get("/api/v2/journal");
    return response.data as Promise<Journal>;
  }

  async searchJournal(payload: JournalSearchPayload): Promise<Journal> {
    const response = await this.http.post("/api/v2/journal", payload);
    if (response.status !== 200) {
      throw new Error(
        `Hoverfly could not serach journal. Payload: ${JSON.stringify(payload)} Response: ${response.data.error}`,
      );
    }
    return response.data as Promise<Journal>;
  }

  async getSimulation(): Promise<Simulation> {
    const response = await this.http.get("/api/v2/simulation");
    return buildSimulation(response.data.data.pairs as Array<{ request: RequestMatcher; response: ResponseData }>);
  }

  async uploadSimulation(payload: Simulation): Promise<Simulation> {
    const response = await this.http.put("/api/v2/simulation", payload);
    if (response.status !== 200) {
      throw new Error(
        `Hoverfly simulation rejected. Payload: ${JSON.stringify(payload)} Response: ${response.data.error}`,
      );
    }
    return response.data as Promise<Simulation>;
  }

  async purgeSimulation(): Promise<Simulation> {
    const response = await this.http.delete("/api/v2/simulation");
    if (response.status !== 200) {
      throw new Error(`Hoverfly could not delete simulation. Response: ${response.data.error}`);
    }
    return response.data as Promise<Simulation>;
  }

  async withSimulation(simulation: Simulation, fn: () => void): Promise<void> {
    const existingSimulation = await this.getSimulation();
    const newSimulation = mergeSimulations(existingSimulation, simulation);
    await this.uploadSimulation(newSimulation);
    fn();
    await this.uploadSimulation(existingSimulation);
  }

  async appendSimulation(simulation: Simulation): Promise<void> {
    const existingSimulation = await this.getSimulation();
    const newSimulation = mergeSimulations(existingSimulation, simulation);
    await this.uploadSimulation(newSimulation);
  }
}
