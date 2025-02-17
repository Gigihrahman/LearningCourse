import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v0.0.1",
    title: "Dokumentasi Api Acara",
    description: "Dokumentasi Api Acara",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local server",
    },
    {
      url: "https://learning-course-rouge.vercel.app/api",
      description: "deploy server",
    },
  ],
  components: {
    securitySchemas: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      LoginRequest: {
        identifier: "sasa1",
        password: "123123",
      },
      RegisterRequest: {
        fullName: "joni jono",
        username: "joni2023",
        email: "joniaja@yopmail.com",
        password: "Baca123123",
        confirmPassword: "Baca123123",
      },
      ActivationRequest: {
        code: "abcdef",
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFile = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFile, doc);
