import fetch from "node-fetch";
import { GIF, decode, Frame, Image } from "imagescript";
export const route = {
    method: "get",
    execute: async (req, res) => {
        const { image, degrees } = req.query;
        if (!image) return res.send({
            message: "Please provide an image url with the query param 'image'"
        })
        if (!degrees || isNaN(+degrees)) return res.send({
            message: "Please provide a degrees to the query param 'degrees'"
        })
        const url = await fetch(image).then(x => x.arrayBuffer()).then(decode),
            isGif = url instanceof GIF;
        if (isGif) {
            for (const frame of url) frame.rotate(degrees);
            const rImage = Buffer.from(await new GIF([...url]).encode(100)).toString('base64');
            return res
                .setHeader("content-Type", "image/gif")
                .send(Buffer.from(rImage, 'base64'))
        } else {
            url.rotate(degrees);
            const rImage = Buffer.from(await url.encode(100)).toString('base64')
            return res
                .setHeader("content-Type", "image/png")
                .send(Buffer.from(rImage, 'base64'))
        };

    }
}