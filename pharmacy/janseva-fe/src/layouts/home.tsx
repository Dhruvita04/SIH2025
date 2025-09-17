import { Footer, Header } from "@/components/home"
import { Outlet } from "react-router-dom"

function Home() {
    return (
        <>
            <Header />

            <Outlet />

            <Footer />

        </>
    )
}

export default Home