


// const uploadImg = () =>
//     "https://images.unsplash.com/photo-1689671439720-47c45b6a7a74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw1fHx8ZW58MHx8fHx8&auto=format&fit=crop&w=500&q=60";
// }

import {uploadImage} from "../common/cloudinary.jsx";

const uploadImg = async(file) => {

    const url = await uploadImage(file)
    //
    // const imageURL = URL.createObjectURL(file);
    // console.log(imageURL);
    return url;
};


export const onImageUpload = async (file, api) => {
    const url = await uploadImg(file);

    const insertedMarkdown =
        `**![](${url})**` +
        `<!--rehype:style=display: flex; justify-content: center; width: 100%; max-width: 500px; margin: auto; margin-top: 4px; margin-bottom: 4px; -->`;
    if (!insertedMarkdown) return;

    api.replaceSelection(insertedMarkdown);
};

export const onImageUpload_DnD = async (file, setMarkdown) => {
    const url = await uploadImg(file);

    const insertedMarkdown =
        `**![](${url})**` +
        `<!--rehype:style=display: flex; justify-content: center; width: 100%; max-width: 500px; margin: auto; margin-top: 4px; margin-bottom: 4px; -->`;
    if (!insertedMarkdown) return;

    setMarkdown((prev) => prev + insertedMarkdown);
};

export const extractYouTubeId = (url) => {
    const pattern = /(?:https?:\/\/(?:www\.)?)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|u\/\w\/|playlist\?list=)|youtu\.be\/)([^#]{11})/;

    const match = url.match(pattern);

    if (match && match[1]) return match[1];
    return;
};

export const onImageDrop = async (dataTransfer, setMarkdown) => {
    const files = [];

    for (let index = 0; index < dataTransfer.items.length; index++) {
        const file = dataTransfer.files.item(index);
        if (file) files.push(file);
    }

    await Promise.all(
        files.map(async (file) => onImageUpload_DnD(file, setMarkdown))
    );
};

export const imgBtn = (inputRef, textApiRef) => ({
    name: "Text To Image",
    keyCommand: "text2image",
    render: (command, disabled, executeCommand) => {
        return (
            <button
                type="button"
                aria-label="Insert title3"
                disabled={disabled}
                onClick={() => {
                    executeCommand(command, command.groupName);
                }}
            >
                <svg width="12" height="12" viewBox="0 0 20 20">
                    <path
                        fill="currentColor"
                        d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z"
                    ></path>
                </svg>
            </button>
        );
    },
    execute: (state, api) => {
        inputRef.current.click();
        textApiRef.current = api;
    }
});


export const editChoice = (inputRef, textApiRef) => [
    imgBtn(inputRef, textApiRef)
];
