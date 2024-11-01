type ModePayloadArguments = {
  matchingStrategy: string;
};

export type ModePayload = {
  mode: string;
  arguments: ModePayloadArguments;
};

type SetModePayloadArguments = {
  headersWhitelist: Array<string>;
  stateful: boolean;
  overwriteDuplicate: boolean;
};

export type SetModePayload = {
  mode: string;
  arguments?: SetModePayloadArguments;
};
