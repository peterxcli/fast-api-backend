export interface Track {
    title: string;
    url: string;
}

export interface Player {
    playTrack: (index: number) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    setTracks: (tracks: Track[]) => Promise<void>;
}

export const createPlayer = (): Player => {
    const audioContext = new AudioContext();
    let currentSource: AudioBufferSourceNode | null = null;
    let allBuffers: AudioBuffer[] = [];
    let currentBuffer: AudioBuffer | null = null;
    let currentTrackIndex = 0;
    let tracks: Track[] = [];

    const playTrack = (index: number) => {
        currentTrackIndex = index;
        console.log('play track', index);
        stop();
        const source = audioContext.createBufferSource();
        console.log('allBuffers', allBuffers[index]);
        source.buffer = allBuffers[index];
        source.connect(audioContext.destination);
        source.start(0);
        currentSource = source;
    };

    const pause = () => {
        if (currentSource) {
            currentSource.stop();
            currentSource = null;
        }
    };

    const resume = () => {
        if (currentSource) {
            currentSource.start(0);
        }
    };

    const stop = () => {
        if (currentSource) {
            currentSource.stop();
            currentSource = null;
        }
        currentTrackIndex = 0;
    };

    const setTracks = async (newTracks: Track[]) => {
        tracks = newTracks;
        const buffers = await Promise.all(
            tracks.map(async (track) => {
                const response = await fetch(track.url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                return audioBuffer;
            })
        );
        console.log(buffers);
        allBuffers = buffers;
    };

    return {
        playTrack,
        pause,
        resume,
        stop,
        setTracks,
    };
};
