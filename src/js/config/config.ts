console.log(import.meta.env);

interface appConfig {
  API_BASE_URL: string;
}

export const config: appConfig = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
};
