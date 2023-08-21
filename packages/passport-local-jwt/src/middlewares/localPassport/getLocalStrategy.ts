import { IStrategyOptions, Strategy as LocalStrategy } from 'passport-local';
import { VerifyFunctionParams } from './verifyFunction';

export type GetLocalStrategyParams = {
  secret: string;
  verify: (options: VerifyFunctionParams) => void;
  options?: IStrategyOptions;
};

export const getLocalStrategy = ({
  secret,
  verify,
  options,
}: GetLocalStrategyParams) => {
  return new LocalStrategy(
    { usernameField: 'email', ...options },
    (username, password, done) => verify({ username, password, done, secret })
  );
};
