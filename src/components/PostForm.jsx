import React, { useEffect, useState } from "react";
import {
  ImEye,
  ImFilePicture,
  ImSpinner11,
  ImFilesEmpty,
  ImSpinner3,
} from "react-icons/im";
import { uploadImage } from "../api/post";
import { useNotification } from "../context/NotificationProvider";
import MarkdownHint from "./MarkdownHint";
import DeviceView from "./DeviceView";

export const defaultPost = {
  title: "",
  thumbnail: "",
  featured: false,
  content: "",
  tags: "",
  meta: "",
};

export default function PostForm({
  onSubmit,
  initialPost,
  postBtnTitle,
  busy,
  resetAfterSubmit,
}) {
  const [postInfo, setPostInfo] = useState(defaultPost);
  const [selectedThumbnailURL, setSelectedThumbnailURL] = useState("");
  const [imageUrlToCopy, setImageUrlToCopy] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [displayMarkdownHint, setDisplayMarkdownHint] = useState(false);
  const [showDeviceView, setShowDeviceView] = useState(false);

  const { title, content, featured, tags, meta } = postInfo;

  const { updateNotification } = useNotification();

  useEffect(() => {
    if (initialPost) {
      setPostInfo({ ...initialPost });
      setSelectedThumbnailURL(initialPost?.thumbnail);
    }
    return () => {
      if (resetAfterSubmit) resetForm();
    };
  }, [initialPost, resetAfterSubmit]);

  const handleChange = ({ target }) => {
    const { name, value, checked } = target;
    if (name === "thumbnail") {
      const file = target.files[0];

      if (!file.type?.includes("image")) {
        return alert("This is not an image!");
      }
      setPostInfo({ ...postInfo, thumbnail: file });
      return setSelectedThumbnailURL(URL.createObjectURL(file));
    }

    if (name === "featured") {
      //   localStorage.setItem({ ...postInfo, featured: checked });
      return setPostInfo({ ...postInfo, [name]: checked });
    }
    if (name === "tags") {
      const newTags = tags.split(",");
      if (newTags.length > 4) {
        updateNotification("warning", "Only first four tags will be Selected");
      }
    }
    if (name === "meta" && meta.length >= 150) {
      return setPostInfo({ ...postInfo, meta: value.substring(0, 149) });
    }

    const newPost = { ...postInfo, [name]: value };

    setPostInfo({ ...newPost });

    localStorage.setItem("blogPost", JSON.stringify(newPost));
  };

  const handleImageUpload = async ({ target }) => {
    if (imageUploading) return;
    const file = target.files[0];

    if (!file.type?.includes("image")) {
      return updateNotification("error", "This is not an image!");
    }
    setImageUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const { error, image } = await uploadImage(formData);
    setImageUploading(false);
    if (error) return updateNotification("error", error);
    setImageUrlToCopy(image);
  };
  const handleOnCopy = () => {
    const textToCopy = `![Add image description](${imageUrlToCopy})`;
    navigator.clipboard.writeText(textToCopy);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, content, tags, meta } = postInfo;

    if (!title.trim()) return updateNotification("error", "Title is required");
    if (!content.trim())
      return updateNotification("error", "Content is required");
    if (!tags.trim()) return updateNotification("error", "Tags is required");
    if (!meta.trim())
      return updateNotification("error", "Meta description is required");

    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z ]/g, " ")
      .split(" ")
      .filter((item) => item.trim())
      .join("-");

    const newTags = tags
      .split(",")
      .map((item) => item.trim())
      .splice(0, 4);

    const formData = new FormData();
    const finalPost = { ...postInfo, tags: JSON.stringify(newTags), slug };

    for (let key in finalPost) {
      formData.append(key, finalPost[key]);
    }

    onSubmit(formData);
  };

  const resetForm = () => {
    setPostInfo({ ...defaultPost });
    localStorage.removeItem("blogPost");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-2 flex ">
        <div className="w-9/12 h-screen space-y-3  flex  flex-col">
          {/* title and submit */}

          <div className="flex items-center justify-between ">
            <h1 className="text-xl font-semibold text-gray-700">
              Create New Post
            </h1>
            <div className="flex items-center space-x-5 ">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center space-x-2 px-3 ring-1 ring-blue-500 h-10 rounded text-blue-500 hover:text-white hover:bg-blue-500 transition"
              >
                <ImSpinner11 />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeviceView(true)}
                className="flex items-center space-x-2 px-3 ring-1 ring-blue-500 h-10 rounded text-blue-500 hover:text-white hover:bg-blue-500 transition "
              >
                <ImEye />
                <span>View</span>
              </button>
              <button className=" ring-1 ring-blue-500 w-36 h-10 rounded text-white hover:text-blue-500 hover:bg-white bg-blue-500 hover:bg-white-500 hover:bg-transparent ">
                {busy ? (
                  <ImSpinner3 className="animate-spin mx-auto text-xl" />
                ) : (
                  postBtnTitle
                )}
              </button>
            </div>
          </div>

          {/* Featured Check box */}
          <div className="flex">
            <input
              name="featured"
              value={featured}
              onChange={handleChange}
              id="featured"
              type="checkbox"
              hidden
            />
            <label
              className=" select-none flex items-center space-x-2 text-gray-700 cursor-pointer group"
              htmlFor="featured"
            >
              <div className="w-4 h-4 rounded-full border-2 border-gray-700 flex  items-center  justify-center group-hover:border-blue-500">
                {featured && (
                  <div className="w-2 h-2 rounded-full  bg-gray-700  group-hover:bg-blue-500" />
                )}
              </div>
              <span className="group-hover:text-blue-500"> Featured</span>
            </label>
          </div>

          {/* Title input */}
          <input
            type="text"
            onFocus={() => setDisplayMarkdownHint(false)}
            value={title}
            name="title"
            onChange={handleChange}
            className="text-xl outline-none focus:ring-1 rounded p-2 w-full font-semibold my-2"
            placeholder="Post title"
          />

          {/* Image Input */}
          <div className="flex space-x-2">
            <div>
              <input
                onChange={handleImageUpload}
                id="image-input"
                type="file"
                hidden
              />
              <label
                htmlFor="image-input"
                className="flex items-center space-x-2 px-3 ring-1 ring-gray-700 h-10 rounded text-gray-700 hover:text-white hover:bg-gray-700 transition cursor-pointer "
              >
                <span>Place image</span>
                {!imageUploading ? (
                  <ImFilePicture />
                ) : (
                  <ImSpinner3 className="animate-spin" />
                )}
              </label>
            </div>

            {imageUrlToCopy && (
              <div className="flex flex-1 justify-between bg-gray-400 rounded  overflow-hidden">
                <input
                  className="bg-transparent px-2 w-full"
                  disabled
                  type="text"
                  value={imageUrlToCopy}
                />
                <button
                  onClick={handleOnCopy}
                  type="button"
                  className="text-xs  flex flex-col p-1  items-center self-stretch justify-center bg-gray-700 text-white "
                >
                  <ImFilesEmpty />
                  <span>copy</span>
                </button>
              </div>
            )}
          </div>

          {/* Post Content */}
          <textarea
            onFocus={() => setDisplayMarkdownHint(true)}
            value={content}
            name="content"
            onChange={handleChange}
            className="resize-none outline-none focus:ring-1 flex-1 rounded p-2 w-full font-semibold font-mono tracking-wide text-lg  "
            placeholder="## You can wirte your post here..."
          ></textarea>

          {/* Tags input */}
          <div>
            <label className="text-gray-500" htmlFor="tags">
              Tags
            </label>
            <input
              value={tags}
              name="tags"
              id="tags"
              type="text"
              onChange={handleChange}
              className=" outline-none focus:ring-1 rounded p-2 w-full "
              placeholder="Tag one, Tag two"
            />
          </div>

          {/* Meta Description*/}
          <div>
            <label className="text-gray-500" htmlFor="meta">
              Meta Description {meta?.length} / 150
            </label>
            <textarea
              name="meta"
              value={meta}
              id="meta"
              onChange={handleChange}
              className="resize-none outline-none focus:ring-1 rounded p-2 w-full font-semibold h-28"
              placeholder="Meta Description"
            ></textarea>
          </div>
        </div>

        <div className="w-1/4 px-6 ">
          <h1 className="text-xl font-semibold mb-2 text-gray-700">
            Thumbnail
          </h1>
          <div>
            <input
              onChange={handleChange}
              name="thumbnail"
              id="thumbnail"
              type="file"
              hidden
            />
            <label htmlFor="thumbnail" className="cursor-pointer">
              {selectedThumbnailURL ? (
                <img
                  src={selectedThumbnailURL}
                  className="aspect-video rounded shadow-sm"
                  alt=""
                />
              ) : (
                <div className="border border-dashed border-gray-500 aspect-video text-gray-500 flex flex-col justify-center items-center ">
                  <span>Select thumbnail</span>
                  <span className="text-xs">Recommended size</span>
                  <span className="text-xs">1280 * 720</span>
                </div>
              )}
            </label>
          </div>
          {/* markdown rules */}
          <div className="  absolute top-1/2 -translate-y-1/2  ">
            {displayMarkdownHint && <MarkdownHint />}
          </div>
        </div>
      </form>

      <DeviceView
        title={title}
        content={content}
        thumbnail={selectedThumbnailURL}
        visible={showDeviceView}
        onClose={() => setShowDeviceView(false)}
      />
    </>
  );
}
