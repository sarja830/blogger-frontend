import  { useContext,useRef,useState,useCallback } from 'react'

import { Link, useNavigate, useParams } from 'react-router-dom'
import lightLogo from '../imgs/logo-light.png'
import darkLogo from '../imgs/logo-dark.png'
import AnimationWrapper from '../common/page-animation'
import lightBanner from '../imgs/blog banner light.png'
import darkBanner from '../imgs/blog banner dark.png'

import {Toaster ,toast} from 'react-hot-toast'
import { EditorContext } from '../pages/editor.pages'

import MDEditor from '@uiw/react-md-editor';
import { tools } from './tools.component'
import { uploadImage } from '../common/cloudinary'
import axios from 'axios'
import { ThemeContext, UserContext } from '../App'





import * as editHelper from "./edit.jsx";

const BlogEditor = () => {


    const navigate = useNavigate()
    let {blog_id} = useParams()
    let {userAuth: {access_token}} = useContext(UserContext)
    // new states

    let {theme} = useContext(ThemeContext)
    let {blog, blog: {title, banner, content, tags, des}, setBlog, textEditor, setTextEditor, setEditorState} = useContext(EditorContext)
    const [value, setValue] = useState(content);



    const handleChangeBanner = (e) =>{
        if(e.target.files[0]){
            let ladingTast = toast.loading('Uploading...')
            uploadImage(e.target.files[0]).then((url) =>{
                toast.dismiss(ladingTast)
                toast.success("Uploaded Successfully")
                setBlog({...blog, banner: url})
            }).catch(err => {
                toast.dismiss(ladingTast)
                toast.error(err)

            })
        }
    }
    const handleTitleKeyDown = (e) =>{
        // for enter key
        if(e.keyCode === 13)
            e.preventDefault()
    }
    const handleTitleChange = (e) =>{
        let input = e.target
        input.style.height = 'auto'
        input.style.height = input.scrollHeight + 'px'
        setBlog({ ...blog, title: input.value})
    }
    const handleError = (e) =>{
        let img = e.target
        img.src = theme == 'light' ? lightBanner : darkBanner;
    }
    const handlePublishEvent = () =>{

        if(!banner.length){
            return toast.error("Upload a blog banner to publish it")
        }
        if(!title.length)
            return toast.error("Write blog title to publish it")
        if(value) {
            setBlog({...blog, content: value})
            setEditorState("publish");
            console.log(blog)
        }
        else
            return toast.error("Write Something in your blog to publish it")

    }
    const handleSaveDraft = (e) =>{
        if(e.target.className.includes('disable')){
            return
        }
        if(!title.length){
            return toast.error("Write Blog Title before saving it as draft")
        }

        let loadingToast = toast.loading("Saving Draft...")

        e.target.classList.add('disable');
        let blogObj = {
            title, banner, des, content:value, tags, draft: true
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/create-blog', {...blogObj, id: blog_id}, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        }).then(() =>{
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast)
            toast.success("Saved successfully");
            setTimeout(() => {
                navigate('/dashboard/blogs?tab=draft')
            }, 0);
        }).catch(({response}) =>{
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast)
            return toast.error(response.data.error)
        }).finally(() =>{
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
        })

    }
    // image support
    const inputRef = useRef(null);
    const editorRef = useRef(null);
    const textApiRef = useRef(null);
    const [isDrag, setIsDrag] = useState(false);

    const [insertImg, setInsertImg] = useState("");

    const inputImageHandler = useCallback(async (event) => {
        if (event.target.files && event.target.files.length === 1) {
            setInsertImg("");
            let ladingTast = toast.loading('Uploading...')
            try {


                await editHelper.onImageUpload(event.target.files[0], textApiRef.current);
                toast.dismiss(ladingTast)
                toast.success("Uploaded Successfully")
            }
            catch {
                toast.dismiss(ladingTast)
                toast.error(err)
            }
            finally {
                toast.dismiss(ladingTast);
            }
        }
    }, []);

    // Drag and Drop
    const startDragHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === "dragenter") setIsDrag(true);
    };

    const dragHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === "dragenter" || event.type === "dragover") {
            setIsDrag(true);
        } else if (event.type === "dragleave") setIsDrag(false);
    };

    const dropHandler = useCallback(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDrag(false);
        await editHelper.onImageDrop(event.dataTransfer, setMarkdown);
    }, []);






    return (
        <>
            <nav className='navbar'>
                <Link to={'/'} className='flex-none w-10'>
                    <img src={theme == 'dark' ? lightLogo : darkLogo} alt="Logo" />
                </Link>
                <p className='max-md:hidden text-black line-clamp-1 w-full'>
                    {title.length ? title : "New Blog"}
                </p>
                <div className='flex gap-4 ml-auto'>
                    <button className='btn-dark py-2 ' onClick={handlePublishEvent}>Publish</button>
                    <button  className='btn-light py-2' onClick={handleSaveDraft}>Save Draft</button>
                </div>
            </nav>
            <Toaster/>
            <AnimationWrapper>
                <section>
                    <div className='mx-auto max-w-[900px] w-full'>
                        <div className='relative aspect-video hover:opacity-80 bg-white border-4 border-grey'>
                            <label htmlFor="uploadBanner">
                                <img src={banner} alt="Default Banner" className='z-20' onError={handleError} />
                                <input type="file" id='uploadBanner' accept='.png, .jpg, .jpeg' hidden onChange={handleChangeBanner}/>
                            </label>

                        </div>

                        <textarea
                            defaultValue={title}
                            placeholder='Blog Title'
                            className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white'
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        >
                         </textarea>
                        <hr className='w-full opacity-10 my-5'/>

                        <div className="container">



                            <input
                                ref={inputRef}
                                className="hidden"
                                type="file"
                                accept=".jpg,.png,.jpeg,.jfif,.gif"
                                name="Hello"
                                value={insertImg}
                                onChange={inputImageHandler}
                            />
                            <div onDragEnter={startDragHandler} className="relative">
                                <MDEditor
                                    height="100%"
                                    ref={editorRef}
                                    value={value}
                                    onChange={(e) => setValue(e)}

                                    extraCommands = {editHelper.editChoice(inputRef, textApiRef)}
                                    // preview="edit"
                                />
                                {isDrag && (
                                    <div
                                        className="absolute bottom-0 left-0 right-0 top-0 h-full w-full bg-red-400 bg-opacity-20 "
                                        onDrop={dropHandler}
                                        onDragEnter={dragHandler}
                                        onDragOver={dragHandler}
                                        onDragLeave={dragHandler}
                                    ></div>
                                )}
                            </div>







                            {/*origininal*/}
                            {/*<MDEditor*/}
                            {/*    height="100%"*/}
                            {/*    value={value}*/}
                            {/*    onChange={setValue}*/}
                            {/*    onPaste={async (event) => {*/}
                            {/*        console.log(event);*/}
                            {/*        console.log(event.clipboardData);*/}
                            {/*        await onImagePasted(event.clipboardData, setValue);*/}
                            {/*    }}*/}
                            {/*    onDrop={async (event) => {*/}
                            {/*        await onImagePasted(event.dataTransfer, setValue);*/}
                            {/*    }}*/}
                            {/*    // hideToolbar*/}
                            {/*/>*/}
                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor
