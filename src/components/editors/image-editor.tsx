import { Box, Button } from '@mantine/core';
import { createRef, forwardRef, useState } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';

export interface IImageEditorProps {
    defaultSrc?: string;
    onCrop?: (data: string) => void;
}

const ImageEditor = forwardRef<HTMLDivElement, IImageEditorProps>(({ onCrop, defaultSrc }, ref) => {
    const [image, setImage] = useState(defaultSrc);
    const cropperRef = createRef<ReactCropperElement>();

    const onChange = (e: any) => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as any);
        };
        reader.readAsDataURL(files[0]);
    };

    const getCropData = () => {
        if (typeof cropperRef.current?.cropper !== 'undefined') {
            if (!onCrop) return;
            onCrop(cropperRef.current?.cropper.getCroppedCanvas().toDataURL());
        }
    };

    return (
        <Box className="flex flex-col gap-3" ref={ref}>
            <Cropper
                ref={cropperRef}
                style={{ height: '400px', width: '100%' }}
                zoomTo={0.5}
                initialAspectRatio={1}
                preview=".img-preview"
                src={image}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                responsive={true}
                autoCropArea={0}
                checkOrientation={false}
                guides={true}
            />

            <input hidden onChange={onChange} type="file" id="edit-image-input" />

            <Box className="flex items-center justify-between gap-4">
                <Button component="label" color="gray" htmlFor="edit-image-input">
                    Choose image
                </Button>
                <Button onClick={getCropData}>Save</Button>
            </Box>
        </Box>
    );
});

export default ImageEditor;
