
// import { fileUpload } from '../../../../../libs/firebase/storage';
import insertToTextArea from './insertToTextArea';

const onImagePasted = async (dataTransfer,  setValue, value )=> {
    // setvalue: (value: SetStateAction)
    const files = [];
    for (let index = 0; index < dataTransfer.items.length; index += 1) {
        const file = dataTransfer.files.item(index);

        if (file) {
            files.push(file);
        }
    }
    const fileUploader = (file) => {
        console.log(file);
        const imageURL = URL.createObjectURL(file);
console.log(imageURL    );
        return imageURL;
    };
    await Promise.all(
        files.map(async (file) => {
            const url = await fileUploader(file);// get url
            const insertedvalue = insertToTextArea(`![](${url})`);
            if (!insertedvalue) {
                return;
            }
            console.log(value)
            setValue(value+ insertedvalue);
            console.log(value);
        }),
    );
};

export default onImagePasted;