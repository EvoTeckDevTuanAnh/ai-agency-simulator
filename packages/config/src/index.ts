export function getConfig() {
  return {
    port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
  };
}
