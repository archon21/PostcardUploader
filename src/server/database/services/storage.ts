import { Storage } from "@google-cloud/storage";
import { uniqueId } from "lodash";
import path from "path";
import stream from "stream";
import fs from "fs";

import { siteConfig } from "../../../site-config";

export const storage = new Storage({
  //   bucket: siteConfig.server.storage.bucket,
  projectId: siteConfig.server.storage.projectId,
  autoRetry: true,
  keyFilename: path.join(__dirname, "..", siteConfig.server.storage.keyFile),
});

import { Content, Menu } from "../schemas";

const StorageService = {
  GET: async ({ request, response }) => {
    const menus = await Menu.find();
    const ret = menus;

    return response?.send ? response.send(ret).status(200) : ret;
  },
  POST: async ({ request, response }) => {
    try {
      // console.log(request.files, request.file, request.body, "FILESPLEASE");

      if (request.files?.length > 0) {
        const promises = request.files.map((file, index) => {
          console.log(file, "FILE");

          return storage
            .bucket(siteConfig.server.storage.bucket)
            .upload(file.path, { contentType: file.mimetype, destination: `${file.filename}.jpg` });
        });
        const result = await Promise.all(promises);
        await console.log(result, "RESULT");
        for (let i = 0; i < result.length; i += 2) {
          const resultOne = result[i]?.[1];
          const resultTwo = result[i + 1]?.[1];
          console.log(resultOne);

          if (resultOne) {
            await Content.create({
              name: resultOne?.id,
              items: {
                photoOne: `https://storage.googleapis.com/${siteConfig.server.storage.bucket}/${resultOne?.name}`,
                photoTwo: `https://storage.googleapis.com/${siteConfig.server.storage.bucket}/${resultTwo?.name}`,
                photoOneId: resultOne?.id,
                photoTwoId: resultTwo?.id,
                photoOneName: resultOne?.name,
                photoTwoName: resultTwo?.name,
              },
            });
          }
        }
        Promise.all(
          request.files?.map((file) => {
            return fs.unlink(file.path, (err) => console.error(err));
          })
        );
        return response.status(204).send(result);
      }
      return response.status(200).send();
    } catch (err) {
      console.error(err);
      return response.status(500).send();
    }
  },
  PATCH: async ({ request, response }) => {
    try {
      const { menus } = request.body;

      const [menu] = menus;
      const updatedMenu = await Menu.updateOne({ _id: menu._id }, menu);

      return response.status(200).send();
    } catch (err) {
      console.error(err);
      return response.status(500).send();
    }
  },
};

export default StorageService;
