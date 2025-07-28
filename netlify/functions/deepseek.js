// netlify/functions/deepseek.js
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "FONCTION ACTIVE",
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      message: "Test réussi depuis GitHub Web!"
    })
  };
};
