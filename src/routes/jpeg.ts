import fetch from "node-fetch";
import { GIF, decode, Frame, Image } from "imagescript";
export const route = {
    method: "get",
    execute: async (req, res) => {
        const { image, degrees } = req.query;
        if (!image) return res.send({
            message: "Please provide an image url with the query param 'image'"
        })
        const url = await fetch(image).then(x => x.arrayBuffer()).then(decode),
            isGif = url instanceof GIF;
        if (isGif) {
            for (const frame of url) frame.red(10).lightness(0.7).red(50).green(10)
            const rImage = Buffer.from(await new GIF([...url]).encode(100)).toString('base64');
            return res
                .setHeader("content-Type", "image/gif")
                .send(Buffer.from(rImage, 'base64'))
        } else {
            url.red(10).lightness(0.7).red(50).green(10)
            const rImage = Buffer.from(await url.encodeJPEG(1)).toString('base64')
            return res
                .setHeader("content-Type", "image/png")
                .send(Buffer.from(rImage, 'base64'))
        };

    }
}