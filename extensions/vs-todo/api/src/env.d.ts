declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
  }
}
