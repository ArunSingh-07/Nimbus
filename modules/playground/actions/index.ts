"use server";

import { db } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { currentUser } from "@/modules/auth/actions";

export const getPlaygroundById = async (id: string) => {
  try {
    const playground = await db.playground.findUnique({
      where: { id },
      select: {
        title: true,
        templateFiles: {
          select: {
            content: true,
          },
        },
      },
    });

    if (playground) {
      await db.playground.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    }

    return playground;
  } catch (error) {
    console.log(error);
  }
};

export const SaveUpdatedCode = async (
  playgroundId: string,
  data: TemplateFolder
) => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const updatedPlayground = await db.templateFile.upsert({
      where: {
        playgroundId,
      },
      update: {
        content: JSON.stringify(data),
      },
      create: {
        playgroundId,
        content: JSON.stringify(data),
      },
    });

    await db.playground.update({
      where: { id: playgroundId },
      data: { updatedAt: new Date() },
    });

    return updatedPlayground;
  } catch (error) {
    console.log("SaveUpdatedCode error", error);
    return null;
  }
};
