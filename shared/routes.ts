import { z } from "zod";
import { insertStationSchema, stations } from "./schema";

export const api = {
  stations: {
    list: {
      method: "GET" as const,
      path: "/api/stations",
      responses: {
        200: z.array(z.custom<typeof stations.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/stations",
      input: insertStationSchema,
      responses: {
        201: z.custom<typeof stations.$inferSelect>(),
      },
    },
  },
};
