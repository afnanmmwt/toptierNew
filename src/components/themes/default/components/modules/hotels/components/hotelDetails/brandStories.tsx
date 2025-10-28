
const BrandStories = (story:any) => {
  if (!story?.story?.desc_text && !story?.story?.picture) {
    return null;
  }
    // console.log("brand stories",story);
    const {picture, desc_text} = story?.story || {};
  return (
     <section className="way-to-travel my-10 max-w-[1200px] mx-auto appHorizantalSpacing">
        <h1 className="font-[700] text-2xl my-6">The Toptier Way to Travel</h1>
        <div className="grid grid-cols-12 gap-5">
          <div className="lg:col-span-3 md:col-span-6 col-span-12 flex flex-col gap-3">
            <img className="h-32 rounded-sm" src={picture || "/images/auth_bg.jpg"} alt="" />
            <p className="font-[500] text-lg text-[#0F172B] truncate">
                <div dangerouslySetInnerHTML={{ __html: desc_text || "" }}></div>
            </p>
          </div>
        </div>
      </section>
    )
}
export default BrandStories;