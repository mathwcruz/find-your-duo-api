import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

import { convertHourStringToMinutes } from "./utils/convertHourStringToMinutes";
import { convertMinutesToHourString } from "./utils/convertMinutesToHourString";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return res.status(201).json(games);
});

app.get("/games/:id/ads", async (req, res) => {
  const gameId = req?.params?.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const adsFormatted = ads?.map((ad) => {
    return {
      ...ad,
      weekDays: ad?.weekDays?.split(","),
      hourStart: convertMinutesToHourString(ad?.hourStart),
      hourEnd: convertMinutesToHourString(ad?.hourEnd),
    };
  });

  return res.status(201).json(adsFormatted);
});

app.get("/ads/:id/discord", async (req, res) => {
  const adId = req?.params?.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });

  return res.status(201).json({ discord: ad?.discord });
});

app.post("/games/:id/ads", async (req, res) => {
  const gameId = req?.params?.id;
  const adData = req?.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: adData?.name,
      yearsPlaying: adData?.name,
      discord: adData?.discord,
      weekDays: adData?.weekDays?.join(","),
      hourStart: convertHourStringToMinutes(adData?.hourStart),
      hourEnd: convertHourStringToMinutes(adData?.hourEnd),
      useVoiceChannel: adData?.useVoiceChannel,
    },
  });

  return res.status(201).json(ad);
});

app.listen(3333);
