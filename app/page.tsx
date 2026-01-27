import Header from "./components/header";
import Footer from "./components/footer";
import WieBenIk from "./wie-ben-ik/wie-ben-ik";
import OnsAanbod from "./ons-aanbod/ons-aanbod";
import WatKostHet from "./wat-kost-het/wat-kost-het";
import NuttigeLinksInfo from "./nuttige-links-info/nuttige-links-info";
import Welcome from "./welcome/welcome";

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <Welcome />
        <WieBenIk />
        <OnsAanbod />
        <WatKostHet />
        <NuttigeLinksInfo />
      </main>
      <Footer />
    </div>
  );
}