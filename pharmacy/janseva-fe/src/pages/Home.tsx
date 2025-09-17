import { ActionBar, BrandSlider, ProductSlider, Slider, SubstitutesSection } from "@/components/home"
import Hero from "@/components/home/Hero"
import TagsProductSlider from "@/components/home/TagsProductSlider"
import { ORDER_PHONE, ORDER_PRESCRIPTION } from "@/CONFIG/routes"
// Import Swiper React components

function Home() {


    return (
        <>
            <Hero />

            <ActionBar LeftImageLink={ORDER_PRESCRIPTION} RightImageLink={ORDER_PHONE} />
            
            <Slider showTitle={true} title="Categories" description="Shop by category" />
            
            <SubstitutesSection />

            {/* <Slider showTitle={false} title="Section Title" description="Lorem ipsum dolor sit amet consectetur adipisicing elit." /> */}

            <ProductSlider showTitle={true} title="Featured Products" description="Top selling products" />

            <BrandSlider title="Brands" showTitle={true} />

            <ProductSlider showTitle={true} title="Top Selling Products" description="Top selling products" />

            <TagsProductSlider title="Diabetes Medications" description="Diabetes medications" tags={["diabetes"]} showTitle={true} />


        </>
    )
}

export default Home