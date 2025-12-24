import { useState, useMemo, useEffect } from 'react';

interface ImageWithLoaderProps {
    prompt: string;
}

const ImageWithLoader = ({ prompt }: ImageWithLoaderProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const targetUrl = useMemo(() => {
        return `https://gen.pollinations.ai/image/${encodeURIComponent(prompt + " high quality, 4k, digital art, clear detailed vector, educational content, white background, no text, no blur")}?width=1024&height=1024&nologo=true&model=flux`;
    }, [prompt]);

    useEffect(() => {
        let isMounted = true;

        const fetchImage = async () => {
            setIsLoading(true);
            setHasError(false);
            try {
                const apiKey = process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY;
                const headers: HeadersInit = {};
                if (apiKey) {
                    headers['Authorization'] = `Bearer ${apiKey}`;
                }

                const response = await fetch(targetUrl, { headers });

                if (!response.ok) {
                    throw new Error(`Failed to load image: ${response.status}`);
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                if (isMounted) {
                    setImageSrc(objectUrl);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Image loading error:", error);
                if (isMounted) {
                    setHasError(true);
                    setIsLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            // Cleanup object URL if it exists (not strictly necessary for this simple case but good practice)
        };
    }, [targetUrl]);

    return (
        <div className="mb-4 flex flex-col items-center md:items-start">
            <div className={`relative rounded-lg overflow-hidden border border-slate-700 shadow-md bg-white ${isLoading ? 'min-h-[200px] w-full max-w-[300px] flex items-center justify-center bg-slate-800' : ''}`}>

                {/* Loading Skeleton / Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-gray-400 p-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mb-2"></div>
                        <span className="text-xs animate-pulse">Sedang menggambar...</span>
                    </div>
                )}

                {/* Error State */}
                {hasError && (
                    <div className="p-8 text-center text-red-400 text-sm bg-slate-800 w-full">
                        Gagal memuat gambar.
                    </div>
                )}

                {/* The Actual Image */}
                {imageSrc && !isLoading && !hasError && (
                    <img
                        src={imageSrc}
                        alt="Ilustrasi Soal"
                        className="max-h-60 w-auto object-contain transition-opacity duration-500 opacity-100"
                    />
                )}
            </div>
        </div>
    );
};

export default ImageWithLoader;
