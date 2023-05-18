import { Track } from "./lib/player";

interface Config {
    tracks: Track[];
    baseUrl?: string;
}

const config: Config = {
    baseUrl: "http://localhost:8000",
    tracks: [],
}

export default config