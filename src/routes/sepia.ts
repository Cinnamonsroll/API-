import fetch from "node-fetch";
import { GIF, decode, Frame, Image } from "imagescript";
export const route = {
    method: "get",
    execute: async (req, res) => {
        const { image } = req.query;
        if (!image) return res.send({
            message: "Please provide an image url with the query param 'image'"
        })
        const url = await fetch(image).then(x => x.arrayBuffer()).then(decode),
            isGif = url instanceof GIF, rt = (x) => Math.min(x, 255);
        if (isGif) {
            for (const frame of url) {
                for (let x = 1; x < frame.width; x++) {
                    for (let y = 1; y < frame.height; y++) {
                        let [r, g, b, a] = frame.getRGBAAt(x, y),
                            new_r = (r * .393) + (g * .769) + (b * .189),
                            new_g = (r * .349) + (g * .686) + (b * .168),
                            new_b = (r * .272) + (g * .534) + (b * .131);

                        frame.setPixelAt(x, y, Image.rgbaToColor(
                            rt(new_r),
                            rt(new_g),
                            rt(new_b),
                            a
                        ))
                    }
                }
            }
            const rImage = Buffer.from(await new GIF([...url]).encode(100)).toString('base64');
            return res
                .setHeader("content-Type", "image/gif")
                .send(Buffer.from(rImage, 'base64'))
        } else {
            for (let x = 1; x < url.width; x++) {
                for (let y = 1; y < url.height; y++) {
                    let [r, g, b, a] = url.getRGBAAt(x, y),
                        new_r = (r * .393) + (g * .769) + (b * .189),
                        new_g = (r * .349) + (g * .686) + (b * .168),
                        new_b = (r * .272) + (g * .534) + (b * .131);
                    url.setPixelAt(x, y, Image.rgbaToColor(
                        rt(new_r),
                        rt(new_g),
                        rt(new_b),
                        a
                    ))
                }
            }

            const rImage = Buffer.from(await url.encode(100)).toString('base64')
            return res
                .setHeader("content-Type", "image/png")
                .send(Buffer.from(rImage, 'base64'))
        };

    }
}