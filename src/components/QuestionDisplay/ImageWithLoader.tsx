import { useState } from 'react';

interface ImageWithLoaderProps {
    prompt: string;
}

const ImageWithLoader = ({ prompt }: ImageWithLoaderProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", high quality, 4k, digital art, clear detailed vector, educational content, white background, no text, no blur")}`;

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
                <img
                    src={imageUrl}
                    alt="Ilustrasi Soal"
                    className={`max-h-60 w-auto object-contain transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => { setIsLoading(false); setHasError(true); }}
                />
            </div>
        </div>
    );
};

export default ImageWithLoader;
