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
            lego = await fetch(
                "https://i.imgur.com/adeIe6c.png"
            )
                .then((r) => r.arrayBuffer())
                .then(decode),
            isGif = url instanceof GIF;
        const origin = {
            width: url.width,
            height: url.height
        }, divideBy = (url.width + url.height) / 54;
        url.resize(url.width / divideBy, url.height / divideBy)
        url.resize(origin.width, origin.height);
        const legoImage = new Image(url.width, url.height);
        lego.resize(divideBy, divideBy, "RESIZE_NEAREST_NEIGHBOR");
        if (isGif) {
            const frames = [];
            for (const frame of url){
                const image = new Image(frame.width, frame.height);
                for (let x = 1; x < image.height; x += lego.height) {
                    for (let y = 1; y < image.width; y += lego.width) {
                        image.drawBox(x, y, lego.width, lego.height, frame.getPixelAt(x, y));
                        image.composite(lego, x, y);
                    }
                }
                frames.push(
                    //@ts-expect-error
                    Frame.from(image, frame.duration, 0, 0, Frame.DISPOSAL_BACKGROUND)
                );
            }
            
            const rImage = Buffer.from(await new GIF([...frames]).encode(100)).toString('base64');
            return res
                .setHeader("content-Type", "image/gif")
                .send(Buffer.from(rImage, 'base64'))
        } else {
            for (let x = 1; x < url.height; x += lego.height) {
                for (let y = 1; y < url.width; y += lego.width) {
                    if (url.getPixelAt(x, y) === 0) return
                    legoImage.drawBox(x, y, lego.width, lego.height, url.getPixelAt(x, y))
                    legoImage.composite(lego, x, y);
                }
            }
            const rImage = Buffer.from(await legoImage.encode(100)).toString('base64')
            return res
                .setHeader("content-Type", "image/png")
                .send(Buffer.from(rImage, 'base64'))
        };

    }
}